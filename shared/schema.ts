import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  recoveryStage: text("recovery_stage").default('initial'),
  cleanDays: integer("clean_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mood: text("mood").notNull(),
  cravingsLevel: integer("cravings_level").notNull(),
  notes: text("notes"),
  triggers: jsonb("triggers").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const amandaChats = pgTable("amanda_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCheckinSchema = createInsertSchema(dailyCheckins).omit({ id: true, createdAt: true });
export const insertChatSchema = createInsertSchema(amandaChats).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Checkin = typeof dailyCheckins.$inferSelect;
export type Chat = typeof amandaChats.$inferSelect;

export type CreateCheckinRequest = z.infer<typeof insertCheckinSchema>;
export type CreateChatRequest = z.infer<typeof insertChatSchema>;
