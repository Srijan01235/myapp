import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique(),
  mobile: varchar("mobile", { length: 15 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),  
});

export const signupUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  emailOrMobile: z.string().min(1, "Email or mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupUserClientSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  emailOrMobile: z.string().min(1, "Email or mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  customerName: text("customer_name").notNull(),
  items: text("items").notNull(), // JSON string of order items
  total: text("total").notNull(), // Using text to avoid precision issues
  status: text("status").notNull().default("pending"),
  timestamp: text("timestamp").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(), // Using text to avoid precision issues
  category: text("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"), // URL to the uploaded image
});

export const loginAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type SignupUser = z.infer<typeof signupUserSchema>;
export type SignupUserClient = z.infer<typeof signupUserClientSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type LoginAdmin = z.infer<typeof loginAdminSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
