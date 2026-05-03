import { pgTable, text, date, uniqueIndex } from "drizzle-orm/pg-core";

export const streakActivity = pgTable(
  "streak_activity",
  {
    userId: text("user_id").notNull(),
    activityDate: date("activity_date").notNull(),
  },
  (t) => [uniqueIndex("streak_activity_user_date_idx").on(t.userId, t.activityDate)],
);

export type StreakActivity = typeof streakActivity.$inferSelect;
