import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const adminEmailsTable = pgTable("admin_emails", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminConfigTable = pgTable("admin_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminEmail = typeof adminEmailsTable.$inferSelect;
export type AdminConfig = typeof adminConfigTable.$inferSelect;
