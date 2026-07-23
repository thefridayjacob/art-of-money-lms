/**
 * Parser: turns the course markdown into structured data for seeding.
 *
 * The source (content/course.md) has a very regular shape:
 *   # PART ONE: ...            → parts (1..4)
 *   ## LESSON 1 — ...          → lessons (1..15)
 *     > **The Big Idea:** ...   → bigIdea
 *     ### Start here            → startHere
 *     ### 🧠 THE MODELS         → models (**MODEL n — Title.** body)
 *     ### 🇳🇬 NIGERIA CHECK      → nigeriaCheck
 *     ### 📺 WATCH              → resources (kind: watch)
 *     ### 📚 READ               → resources (kind: read | article)
 *     ### ✍️ HOMEWORK           → homework
 *     ### ⚡ ONE-MINUTE RECAP    → recap
 *
 * A few lessons deviate (Lesson 13 has multiple WATCH blocks; Lesson 14
 * groups models under A/B/C sub-headers; Lesson 15 has no models). The
 * parser tolerates all of this by bucketing on header type, not position.
 */

export type ParsedResource = {
  kind: "watch" | "read" | "article";
  title: string;
  url: string | null;
  author: string | null;
  note: string | null;
  sort: number;
};

export type ParsedModel = {
  number: number;
  title: string;
  body: string;
  sort: number;
};

export type ParsedLesson = {
  number: number;
  slug: string;
  title: string;
  bigIdea: string | null;
  startHere: string | null;
  nigeriaCheck: string | null;
  homework: string | null;
  recap: string | null;
  models: ParsedModel[];
  resources: ParsedResource[];
};

export type ParsedPart = {
  number: number;
  slug: string;
  title: string;
  lessons: ParsedLesson[];
};

const WORD_NUM: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
};

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'".,:;()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}

/** Classify a `### ` header into a bucket key. */
function classifyHeader(h: string): string {
  const t = h.toUpperCase();
  if (/START HERE/.test(t)) return "startHere";
  if (t.includes("🧠") || /THE MODELS/.test(t)) return "models";
  if (/NIGERIA CHECK/.test(t)) return "nigeriaCheck";
  if (/WATCH/.test(t)) return "watch";
  if (/READ/.test(t)) return "read";
  if (/HOMEWORK/.test(t)) return "homework";
  if (/RECAP/.test(t)) return "recap";
  return "other";
}

/** Parse `**MODEL n — Title.** body...` blocks out of a text chunk. */
function parseModels(text: string): ParsedModel[] {
  if (!text.trim()) return [];
  const re = /\*\*MODEL\s+(\d+)\s*[—-]\s*([\s\S]*?)\*\*([\s\S]*?)(?=\*\*MODEL\s+\d+\s*[—-]|$)/g;
  const out: ParsedModel[] = [];
  let m: RegExpExecArray | null;
  let sort = 0;
  while ((m = re.exec(text)) !== null) {
    const number = parseInt(m[1], 10);
    let title = m[2].trim().replace(/[.:]\s*$/, "");
    title = stripMd(title);
    const body = m[3].trim();
    out.push({ number, title, body, sort: sort++ });
  }
  return out;
}

/** Split a WATCH/READ chunk into individual bullet entries (bullet + its
 * indented continuation lines), then extract fields from each. */
function parseResources(
  text: string,
  section: "watch" | "read",
): ParsedResource[] {
  if (!text.trim()) return [];
  const lines = text.split("\n");
  const entries: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (current !== null) entries.push(current);
      current = line.trim();
    } else if (current !== null && line.trim() !== "") {
      // continuation (the italic note under a bullet)
      current += "\n" + line.trim();
    }
  }
  if (current !== null) entries.push(current);

  return entries.map((raw, i) => extractResource(raw, section, i));
}

function extractResource(
  raw: string,
  section: "watch" | "read",
  sort: number,
): ParsedResource {
  // kind
  let kind: ParsedResource["kind"] = section === "watch" ? "watch" : "read";
  if (section === "read" && /\*\*Article:\*\*/i.test(raw)) kind = "article";

  // url — first http(s) link, trimmed of trailing punctuation
  const urlMatch = raw.match(/(https?:\/\/[^\s)]+)/);
  const url = urlMatch ? urlMatch[1].replace(/[.,]+$/, "") : null;

  // note — the italic continuation line(s)
  const noteMatch = raw.match(/\n\*([\s\S]+?)\*\s*$/);
  const note = noteMatch ? noteMatch[1].trim() : null;

  // First-line content (before any continuation)
  const firstLine = raw.split("\n")[0];
  const bolds = [...firstLine.matchAll(/\*\*(.+?)\*\*/g)].map((b) => b[1]);

  let title: string;
  let author: string | null = null;

  const bookLabel = bolds.find((b) => /^(Book|Article):/i.test(b));
  if (bookLabel) {
    // Book/Article: drop the **Book:**/**Article:** label, then the title is
    // the italic *...* (books) or the text up to the arrow (linked articles).
    const rest = firstLine
      .replace(/^[-*]\s+/, "")
      .replace(/\*\*(Book|Article):\*\*/i, "")
      .trim();
    const ital = rest.match(/\*([^*]+)\*/);
    title = ital ? ital[1].trim() : stripMd(rest.split(/→/)[0]).trim();
    const authorMatch = rest.match(/\*[^*]+\*\s*[—-]\s*([^(]+)/);
    if (authorMatch) author = authorMatch[1].trim();
  } else if (bolds.length > 0) {
    title = stripMd(bolds[0]).replace(/\s*[—-]\s*$/, "").trim();
  } else {
    // no bold — take text up to → or — or end
    const cleaned = firstLine.replace(/^[-*]\s+/, "");
    title = stripMd(cleaned.split(/→|—/)[0]).trim();
  }

  return { kind, title: title || "Untitled", url, author, note, sort };
}

export function parseCourse(md: string): ParsedPart[] {
  const lines = md.split("\n");

  type Marker = { type: "part" | "lesson" | "end"; line: number; raw: string };
  const markers: Marker[] = [];

  lines.forEach((line, i) => {
    if (/^#\s+PART\s+(ONE|TWO|THREE|FOUR):/i.test(line)) {
      markers.push({ type: "part", line: i, raw: line });
    } else if (/^##\s+LESSON\s+\d+\s*[—-]/i.test(line)) {
      markers.push({ type: "lesson", line: i, raw: line });
    } else if (/^##\s+THE POINT OF ALL THIS/i.test(line)) {
      markers.push({ type: "end", line: i, raw: line });
    }
  });

  const parts: ParsedPart[] = [];
  const lessonMarkers = markers.filter((m) => m.type === "lesson");

  // Map each lesson to its owning part (most recent part header above it)
  const partMarkers = markers.filter((m) => m.type === "part");
  const endLine =
    markers.find((m) => m.type === "end")?.line ?? lines.length;

  for (const pm of partMarkers) {
    const pMatch = pm.raw.match(/^#\s+PART\s+(ONE|TWO|THREE|FOUR):\s*(.+)$/i);
    if (!pMatch) continue;
    const number = WORD_NUM[pMatch[1].toUpperCase()];
    const title = pMatch[2].trim();
    parts.push({ number, slug: kebab(title), title, lessons: [] });
  }

  lessonMarkers.forEach((lm, idx) => {
    const lMatch = lm.raw.match(/^##\s+LESSON\s+(\d+)\s*[—-]\s*(.+)$/i);
    if (!lMatch) return;
    const number = parseInt(lMatch[1], 10);
    const title = lMatch[2].trim();

    // body runs to the next lesson marker (or the end marker / EOF)
    const nextLine = lessonMarkers[idx + 1]?.line ?? endLine;
    const body = lines.slice(lm.line + 1, nextLine).join("\n");

    // owning part = last part marker before this lesson
    let owningPartNumber = 1;
    for (const pm of partMarkers) {
      if (pm.line < lm.line) {
        const pMatch = pm.raw.match(/PART\s+(ONE|TWO|THREE|FOUR)/i);
        if (pMatch) owningPartNumber = WORD_NUM[pMatch[1].toUpperCase()];
      }
    }

    const lesson = parseLessonBody(number, title, body);
    const part = parts.find((p) => p.number === owningPartNumber);
    part?.lessons.push(lesson);
  });

  return parts;
}

function parseLessonBody(
  number: number,
  title: string,
  body: string,
): ParsedLesson {
  const bodyLines = body.split("\n");

  // Big Idea (blockquote before the first ### header)
  const bigIdeaMatch = body.match(/^>\s*\*\*The Big Idea:\*\*\s*(.+)$/m);
  const bigIdea = bigIdeaMatch ? stripMd(bigIdeaMatch[1]).trim() : null;

  const buckets: Record<string, string[]> = {};
  let currentBucket: string | null = null;

  for (const line of bodyLines) {
    const headerMatch = line.match(/^###\s+(.+)$/);
    if (headerMatch) {
      currentBucket = classifyHeader(headerMatch[1]);
      buckets[currentBucket] ??= [];
      continue;
    }
    if (currentBucket) buckets[currentBucket].push(line);
  }

  const text = (k: string) => (buckets[k] ? buckets[k].join("\n").trim() : "");

  const models = parseModels(text("models"));
  const resources = [
    ...parseResources(text("watch"), "watch"),
    ...parseResources(text("read"), "read"),
  ].map((r, i) => ({ ...r, sort: i }));

  // Lesson 15 has no standard sections — fold "other" content into startHere
  const startHere =
    [text("startHere"), text("other")].filter(Boolean).join("\n\n") || null;

  return {
    number,
    slug: kebab(title),
    title,
    bigIdea,
    startHere,
    nigeriaCheck: text("nigeriaCheck") || null,
    homework: text("homework") || null,
    recap: text("recap") || null,
    models,
    resources,
  };
}
