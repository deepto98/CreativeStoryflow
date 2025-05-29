import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarColor: text("avatar_color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  avatarColor: true,
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull(),
  status: text("status").notNull().default("active"),
  totalPanels: integer("total_panels").notNull().default(6),
  panelCount: integer("panel_count").notNull().default(0),
  contributors: integer("contributors").notNull().default(0),
  coverImage: text("cover_image"),
  timeRemaining: integer("time_remaining").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  isDaily: boolean("is_daily").notNull().default(false),
  createdBy: integer("created_by").references(() => users.id),
  category: text("category").notNull(),
  daysLeft: integer("days_left").notNull().default(3),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  tags: true,
  totalPanels: true,
  coverImage: true,
  isDaily: true,
  category: true,
});

// Panels table
export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  caption: text("caption"),
  imageUrl: text("image_url").notNull(),
  votes: integer("votes").notNull().default(0),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPanelSchema = createInsertSchema(panels).pick({
  challengeId: true,
  prompt: true,
  caption: true,
  imageUrl: true,
});

// Votes table
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  panelId: integer("panel_id").references(() => panels.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  panelId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type Panel = typeof panels.$inferSelect & { username: string };
export type InsertPanel = z.infer<typeof insertPanelSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Additional types for frontend
export type CompletedStoryboard = {
  id: number;
  title: string;
  category: string;
  coverImage: string;
  panelCount: number;
  completedAt: Date;
  contributors: string[];
};

export type CommunityChallenge = {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  status: string;
  contributors: number;
  daysLeft: number;
};
