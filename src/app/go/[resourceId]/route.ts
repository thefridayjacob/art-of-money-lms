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
  if (!resource?.url) {
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

  return NextResponse.redirect(resource.url);
}
