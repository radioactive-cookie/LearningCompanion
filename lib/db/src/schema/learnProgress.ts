import { pgTable, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const learnProgress = pgTable(
  "learn_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    language: text("language").notNull(),
    difficulty: text("difficulty").notNull(),
    topic: text("topic").notNull(),
    completedLevels: integer("completed_levels").array().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("learn_progress_user_topic_idx").on(t.userId, t.language, t.difficulty, t.topic)],
);

export const insertLearnProgressSchema = createInsertSchema(learnProgress);

export type LearnProgress = typeof learnProgress.$inferSelect;
export type InsertLearnProgress = z.infer<typeof insertLearnProgressSchema>;
