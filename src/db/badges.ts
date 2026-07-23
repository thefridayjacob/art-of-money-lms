/**
 * Badge catalog. `criteria` + `threshold` are evaluated by the award engine
 * (Phase 5). `color` maps to a peel-pill brand token (teal | pink | amber).
 */

export type BadgeSeed = {
  key: string;
  name: string;
  description: string;
  emoji: string;
  criteria:
    | "lesson_complete"
    | "part_complete"
    | "lessons_count"
    | "models_count"
    | "teach_count"
    | "streak_days";
  threshold: number;
  color: "teal" | "pink" | "amber";
  sort: number;
};

export const BADGES: BadgeSeed[] = [
  {
    key: "first-step",
    name: "First Step",
    description: "Finished Lesson 1. The hardest one to start.",
    emoji: "👣",
    criteria: "lesson_complete",
    threshold: 1,
    color: "teal",
    sort: 10,
  },
  {
    key: "part-one",
    name: "What Money Is",
    description: "Completed Part One.",
    emoji: "🪙",
    criteria: "part_complete",
    threshold: 1,
    color: "teal",
    sort: 20,
  },
  {
    key: "part-two",
    name: "How You Make Money",
    description: "Completed Part Two.",
    emoji: "🛠️",
    criteria: "part_complete",
    threshold: 2,
    color: "amber",
    sort: 30,
  },
  {
    key: "part-three",
    name: "How You Keep Money",
    description: "Completed Part Three.",
    emoji: "🛡️",
    criteria: "part_complete",
    threshold: 3,
    color: "teal",
    sort: 40,
  },
  {
    key: "part-four",
    name: "The Whole Game",
    description: "Completed Part Four.",
    emoji: "♟️",
    criteria: "part_complete",
    threshold: 4,
    color: "pink",
    sort: 50,
  },
  {
    key: "scam-proof",
    name: "Scam-Proof",
    description: "Finished Lesson 12. You can smell a Ponzi now.",
    emoji: "🕵️",
    criteria: "lesson_complete",
    threshold: 12,
    color: "pink",
    sort: 60,
  },
  {
    key: "deck-starter",
    name: "Deck Starter",
    description: "Mastered your first 10 models.",
    emoji: "🃏",
    criteria: "models_count",
    threshold: 10,
    color: "amber",
    sort: 70,
  },
  {
    key: "model-collector",
    name: "Model Collector",
    description: "Mastered all 76 models. The full deck.",
    emoji: "🧠",
    criteria: "models_count",
    threshold: 76,
    color: "teal",
    sort: 80,
  },
  {
    key: "teach-one",
    name: "Each One, Teach One",
    description: "Taught someone your first lesson.",
    emoji: "🗣️",
    criteria: "teach_count",
    threshold: 1,
    color: "pink",
    sort: 90,
  },
  {
    key: "teacher",
    name: "The Teacher",
    description: "Taught someone all 15 lessons. The real test.",
    emoji: "🎓",
    criteria: "teach_count",
    threshold: 15,
    color: "amber",
    sort: 100,
  },
  {
    key: "streak-7",
    name: "One Week Strong",
    description: "A 7-day learning streak.",
    emoji: "🔥",
    criteria: "streak_days",
    threshold: 7,
    color: "amber",
    sort: 110,
  },
  {
    key: "streak-30",
    name: "Unstoppable",
    description: "A 30-day learning streak.",
    emoji: "⚡",
    criteria: "streak_days",
    threshold: 30,
    color: "pink",
    sort: 120,
  },
  {
    key: "finisher",
    name: "Un-Farmable",
    description: "Completed all 15 lessons. Nobody farms you now.",
    emoji: "🏆",
    criteria: "lessons_count",
    threshold: 15,
    color: "teal",
    sort: 130,
  },
];
