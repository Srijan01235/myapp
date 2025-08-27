import { z } from "zod";

// User schema and types
export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export interface User {
  id: number;
  username: string;
  email?: string | null;
  mobile?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Menu item schema and types
export const insertMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl?: string | null;
}

// Order schema and types
export const insertOrderSchema = z.object({
  tableNumber: z.number().min(1, "Table number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  items: z.string().min(1, "Items are required"),
  total: z.string().min(1, "Total is required"),
  status: z.string().optional().default("pending"),
  timestamp: z.string(),
  date: z.string(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export interface Order {
  id: number;
  tableNumber: number;
  customerName: string;
  items: string; // JSON string of cart items
  total: string;
  status: string;
  timestamp: string;
  date: string;
}