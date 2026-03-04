import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  wallet: text("wallet").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  socialLinks: text("social_links"),
  joinDate: timestamp("join_date", { withTimezone: true }).notNull(),
  visibility: text("visibility").notNull().default("public"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const completedEnrollments = pgTable("completed_enrollments", {
  id: serial("id").primaryKey(),
  wallet: text("wallet").notNull(),
  courseId: text("course_id").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  credentialAsset: text("credential_asset"),
  trackId: integer("track_id").notNull(),
  trackLevel: integer("track_level").notNull(),
});
