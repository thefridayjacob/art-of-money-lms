import { NextResponse, type NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { resources, resourceOpens } from "@/db/schema";
import { awardXpOnce } from "@/lib/xp";

/**
 * Tracked outbound redirect. Records that the signed-in user opened this
 * resource (first open awards XP), then 302s to the real destination.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const { resourceId } = await params;

  const [resource] = await db
    .select({ url: resources.url })
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  // Unknown resource or no link → send them back to the course.
  const destination = safeExternalUrl(resource?.url);
  if (!destination) {
    return NextResponse.redirect(new URL("/learn", req.url));
  }

  const session = await auth();
  if (session?.user?.id) {
    const userId = session.user.id;
    await db
      .insert(resourceOpens)
      .values({ userId, resourceId })
      .onConflictDoUpdate({
        target: [resourceOpens.userId, resourceOpens.resourceId],
        set: {
          openCount: sql`${resourceOpens.openCount} + 1`,
          lastOpenedAt: new Date(),
        },
      });
    await awardXpOnce(userId, "resource_opened", resourceId);
  }

  return NextResponse.redirect(destination);
}

/**
 * Normalise a stored resource URL into a valid absolute http(s) URL, or return
 * null. Trims whitespace and trailing markdown punctuation that can leak from
 * the source (e.g. a stray `*`), and adds a scheme if one is missing, so a
 * slightly-dirty URL still redirects instead of throwing a 500.
 */
function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().replace(/[)\]*.,;"'>]+$/, "");
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
