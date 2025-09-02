import { users, admins, orders, menuItems, type User, type InsertUser, type LoginUser, type SignupUser, type Admin, type InsertAdmin, type Order, type InsertOrder, type MenuItem, type InsertMenuItem } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations for custom authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  authenticateAdmin(username: string, password: string): Promise<Admin | null>;

  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getAllMenuItems(): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: InsertMenuItem): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default menu items
    this.initializeDefaultMenuItems();
  }

  private async initializeDefaultMenuItems() {
    // Check if menu items exist
    const existingItems = await this.getAllMenuItems();
    if (existingItems.length > 0) return;

    const defaultItems = [
      { name: 'Margherita Pizza', price: '12.99', category: 'Pizza', description: 'Fresh tomato sauce, mozzarella, basil', imageUrl: '/uploads/pizza-demo.svg' },
      { name: 'Chicken Caesar Salad', price: '9.99', category: 'Salads', description: 'Grilled chicken, romaine, parmesan, croutons', imageUrl: null },
      { name: 'Beef Burger', price: '14.99', category: 'Burgers', description: 'Angus beef patty, lettuce, tomato, onion', imageUrl: '/uploads/burger-demo.svg' },
      { name: 'Pasta Carbonara', price: '13.99', category: 'Pasta', description: 'Spaghetti with eggs, cheese, pancetta', imageUrl: '/uploads/pasta-demo.svg' },
      { name: 'Fish & Chips', price: '16.99', category: 'Main Course', description: 'Beer battered cod with fries', imageUrl: null },
      { name: 'Chocolate Cake', price: '6.99', category: 'Desserts', description: 'Rich chocolate layer cake', imageUrl: null },
      { name: 'Coca Cola', price: '2.99', category: 'Beverages', description: 'Classic cola drink', imageUrl: null },
      { name: 'Coffee', price: '3.99', category: 'Beverages', description: 'Freshly brewed coffee', imageUrl: null }
    ];

    for (const item of defaultItems) {
      await this.createMenuItem(item);
    }
  }

  // User operations for custom authentication

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // Admin operations
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async authenticateAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.getAdminByUsername(username);
    if (admin && admin.password === password) {
      return admin;
    }
    return null;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    const allOrders = await db.select().from(orders);
    return allOrders.sort((a, b) => b.id - a.id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...insertOrder,
        status: insertOrder.status || 'pending',
      })
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Menu Item operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    const allMenuItems = await db.select().from(menuItems);
    return allMenuItems.sort((a, b) => a.id - b.id);
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values(insertMenuItem)
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: number, insertMenuItem: InsertMenuItem): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(insertMenuItem)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();