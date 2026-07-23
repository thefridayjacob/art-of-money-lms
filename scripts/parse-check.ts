import { readFileSync, writeFileSync } from "node:fs";
import { parseCourse } from "../src/db/parse-course";

const md = readFileSync("content/course.md", "utf8");
const parts = parseCourse(md);

let totalLessons = 0;
let totalModels = 0;
let totalResources = 0;
let resourcesWithUrl = 0;

console.log("\n=== COURSE PARSE SUMMARY ===\n");
for (const part of parts) {
  console.log(`PART ${part.number}: ${part.title}  (slug: ${part.slug})`);
  for (const l of part.lessons) {
    totalLessons++;
    totalModels += l.models.length;
    totalResources += l.resources.length;
    resourcesWithUrl += l.resources.filter((r) => r.url).length;
    const flags = [
      l.bigIdea ? "idea" : "—",
      l.startHere ? "start" : "—",
      l.nigeriaCheck ? "NG" : "—",
      l.homework ? "hw" : "—",
      l.recap ? "recap" : "—",
    ].join("/");
    console.log(
      `  L${String(l.number).padStart(2)} ${l.title}\n` +
        `        models:${l.models.length}  resources:${l.resources.length}  [${flags}]`,
    );
  }
}

console.log("\n=== TOTALS ===");
console.log(`parts:      ${parts.length} (expect 4)`);
console.log(`lessons:    ${totalLessons} (expect 15)`);
console.log(`models:     ${totalModels} (expect 76)`);
console.log(`resources:  ${totalResources} (${resourcesWithUrl} with URLs)`);

// model number continuity check
const allModelNums = parts
  .flatMap((p) => p.lessons)
  .flatMap((l) => l.models.map((m) => m.number))
  .sort((a, b) => a - b);
const missing: number[] = [];
for (let n = 1; n <= 76; n++) if (!allModelNums.includes(n)) missing.push(n);
console.log(`model numbers 1..76 missing: ${missing.length ? missing.join(",") : "none ✓"}`);
const dupes = allModelNums.filter((n, i) => allModelNums.indexOf(n) !== i);
console.log(`duplicate model numbers: ${dupes.length ? dupes.join(",") : "none ✓"}`);

writeFileSync(
  "/private/tmp/claude-501/-Users-thefridayjacob/71355c33-9d52-4882-bd26-c9d13f24514e/scratchpad/parsed-course.json",
  JSON.stringify(parts, null, 2),
);
console.log("\nFull JSON → scratchpad/parsed-course.json\n");
