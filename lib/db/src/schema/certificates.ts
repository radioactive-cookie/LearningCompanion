import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const certificates = pgTable(
  "certificates",
  {
    id:         text("id").primaryKey(),
    userId:     text("user_id").notNull(),
    userName:   text("user_name").notNull().default("Learner"),
    language:   text("language").notNull(),
    topic:      text("topic").notNull(),
    issuedAt:   timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("certificates_user_lang_topic_idx").on(t.userId, t.language, t.topic)],
);

export type Certificate = typeof certificates.$inferSelect;
