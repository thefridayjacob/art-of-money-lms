import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  date,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ *
 * Enums
 * ------------------------------------------------------------------ */

export const resourceKind = pgEnum("resource_kind", [
  "watch", // 📺 videos / channels
  "read", // 📚 books
  "article", // linked articles / primary sources
]);

export const lessonStatus = pgEnum("lesson_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const xpKind = pgEnum("xp_kind", [
  "lesson_complete",
  "model_mastered",
  "resource_opened",
  "homework_done",
  "taught_someone",
  "streak_bonus",
  "badge_earned",
]);

export const badgeCriteria = pgEnum("badge_criteria", [
  "lesson_complete", // completed a specific lesson (threshold = lesson number)
  "part_complete", // completed all lessons in a part (threshold = part number)
  "lessons_count", // completed N lessons total
  "models_count", // mastered N models
  "teach_count", // taught N people
  "streak_days", // reached an N-day streak
]);

/* ------------------------------------------------------------------ *
 * Auth.js (Drizzle adapter) — users, accounts, sessions, tokens
 * Extended with app-specific columns on `users`.
 * ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  // App-specific
  displayName: text("display_name"),
  isAdmin: boolean("is_admin").notNull().default(false),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  marketingOptInAt: timestamp("marketing_opt_in_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ------------------------------------------------------------------ *
 * Course content — parts → lessons → models / resources
 * ------------------------------------------------------------------ */

export const parts = pgTable("parts", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(), // 1..4
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
});

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partId: uuid("part_id")
      .notNull()
      .references(() => parts.id, { onDelete: "cascade" }),
    number: integer("number").notNull().unique(), // 1..15 (global order)
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    bigIdea: text("big_idea"), // > **The Big Idea:** ...
    startHere: text("start_here"), // ### Start here (markdown)
    nigeriaCheck: text("nigeria_check"), // ### 🇳🇬 NIGERIA CHECK (markdown)
    homework: text("homework"), // ### ✍️ HOMEWORK (markdown)
    recap: text("recap"), // ### ⚡ ONE-MINUTE RECAP
  },
  (t) => [index("lessons_part_idx").on(t.partId)],
);

export const models = pgTable(
  "models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    number: integer("number").notNull().unique(), // MODEL 1..76
    title: text("title").notNull(),
    body: text("body").notNull(), // markdown
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("models_lesson_idx").on(t.lessonId)],
);

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    kind: resourceKind("kind").notNull(),
    title: text("title").notNull(),
    url: text("url"), // some entries (e.g. books) have no link
    author: text("author"),
    note: text("note"), // the italic annotation under a link
    sort: integer("sort").notNull().default(0),
  },
  (t) => [
    index("resources_lesson_idx").on(t.lessonId),
    // stable natural key so reseeding upserts (preserves resource ids /
    // per-user open tracking) instead of duplicating rows
    uniqueIndex("resources_lesson_kind_sort").on(t.lessonId, t.kind, t.sort),
  ],
);

/* ------------------------------------------------------------------ *
 * Per-user progress
 * ------------------------------------------------------------------ */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: lessonStatus("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [uniqueIndex("lesson_progress_user_lesson").on(t.userId, t.lessonId)],
);

export const resourceOpens = pgTable(
  "resource_opens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    openCount: integer("open_count").notNull().default(1),
    firstOpenedAt: timestamp("first_opened_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    lastOpenedAt: timestamp("last_opened_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("resource_opens_user_resource").on(t.userId, t.resourceId)],
);

export const homeworkStatus = pgTable(
  "homework_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    done: boolean("done").notNull().default(false),
    notes: text("notes"),
    doneAt: timestamp("done_at", { mode: "date" }),
  },
  (t) => [uniqueIndex("homework_user_lesson").on(t.userId, t.lessonId)],
);

export const teachLog = pgTable(
  "teach_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    taughtWho: text("taught_who"), // "my cousin", etc.
    doneAt: timestamp("done_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("teach_user_lesson").on(t.userId, t.lessonId)],
);

export const modelMastery = pgTable(
  "model_mastery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    modelId: uuid("model_id")
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    masteredAt: timestamp("mastered_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("model_mastery_user_model").on(t.userId, t.modelId)],
);

/* ------------------------------------------------------------------ *
 * Gamification — stats, XP ledger, badges
 * ------------------------------------------------------------------ */

export const userStats = pgTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"), // for streak calc (local day)
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: xpKind("kind").notNull(),
    amount: integer("amount").notNull(),
    meta: text("meta"), // e.g. lesson/model id or label
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("xp_events_user_idx").on(t.userId)],
);

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(), // stable slug e.g. "scam-proof"
  name: text("name").notNull(),
  description: text("description").notNull(),
  emoji: text("emoji").notNull().default("🏅"),
  criteria: badgeCriteria("criteria").notNull(),
  threshold: integer("threshold").notNull(), // meaning depends on criteria
  color: text("color").notNull().default("teal"), // peel-pill color token
  sort: integer("sort").notNull().default(0),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_badges_user_badge").on(t.userId, t.badgeId)],
);

/* ------------------------------------------------------------------ *
 * Relations
 * ------------------------------------------------------------------ */

export const partsRelations = relations(parts, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  part: one(parts, { fields: [lessons.partId], references: [parts.id] }),
  models: many(models),
  resources: many(resources),
}));

export const modelsRelations = relations(models, ({ one }) => ({
  lesson: one(lessons, { fields: [models.lessonId], references: [lessons.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  lesson: one(lessons, {
    fields: [resources.lessonId],
    references: [lessons.id],
  }),
}));
