// In-memory storage implementation for deployment
// This version removes database dependencies for simpler deployment

export interface User {
  id: number;
  username: string;
  email?: string;
  mobile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl?: string;
}

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

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  // Menu operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getAllMenuItems(): Promise<MenuItem[]>;
  createMenuItem(menuItem: any): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: any): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: any): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private menuItems: MenuItem[] = [];
  private orders: Order[] = [];
  private nextUserId = 1;
  private nextMenuItemId = 1;
  private nextOrderId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize admin user
    this.users.push({
      id: this.nextUserId++,
      username: 'admin',
      email: 'admin@restaurant.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Initialize default menu items
    const defaultMenuItems = [
      { name: 'Margherita Pizza', price: '12.99', category: 'Pizza', description: 'Fresh tomato sauce, mozzarella, basil', imageUrl: undefined },
      { name: 'Chicken Caesar Salad', price: '9.99', category: 'Salads', description: 'Grilled chicken, romaine, parmesan, croutons', imageUrl: undefined },
      { name: 'Beef Burger', price: '14.99', category: 'Burgers', description: 'Angus beef patty, lettuce, tomato, onion', imageUrl: undefined },
      { name: 'Pasta Carbonara', price: '13.99', category: 'Pasta', description: 'Spaghetti with eggs, cheese, pancetta', imageUrl: undefined },
      { name: 'Fish & Chips', price: '16.99', category: 'Main Course', description: 'Beer battered cod with fries', imageUrl: undefined },
      { name: 'Chocolate Cake', price: '6.99', category: 'Desserts', description: 'Rich chocolate layer cake', imageUrl: undefined },
      { name: 'Coca Cola', price: '2.99', category: 'Beverages', description: 'Classic cola drink', imageUrl: undefined },
      { name: 'Coffee', price: '3.99', category: 'Beverages', description: 'Freshly brewed coffee', imageUrl: undefined }
    ];

    for (const item of defaultMenuItems) {
      this.menuItems.push({
        id: this.nextMenuItemId++,
        ...item,
        imageUrl: item.imageUrl
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData: any): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      username: userData.username,
      email: userData.email,
      mobile: userData.mobile,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    // Simple hardcoded authentication for admin
    if (username === 'admin' && password === 'admin123') {
      return this.users.find(user => user.username === 'admin') || null;
    }
    return null;
  }

  // Menu operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.find(item => item.id === id);
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return [...this.menuItems];
  }

  async createMenuItem(menuItemData: any): Promise<MenuItem> {
    const menuItem: MenuItem = {
      id: this.nextMenuItemId++,
      name: menuItemData.name,
      price: menuItemData.price,
      category: menuItemData.category,
      description: menuItemData.description,
      imageUrl: menuItemData.imageUrl,
    };
    this.menuItems.push(menuItem);
    return menuItem;
  }

  async updateMenuItem(id: number, menuItemData: any): Promise<MenuItem | undefined> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return undefined;

    this.menuItems[index] = {
      ...this.menuItems[index],
      name: menuItemData.name,
      price: menuItemData.price,
      category: menuItemData.category,
      description: menuItemData.description,
      imageUrl: menuItemData.imageUrl,
    };
    return this.menuItems[index];
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.menuItems.splice(index, 1);
    return true;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.find(order => order.id === id);
  }

  async getAllOrders(): Promise<Order[]> {
    return [...this.orders];
  }

  async createOrder(orderData: any): Promise<Order> {
    const order: Order = {
      id: this.nextOrderId++,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || 'pending',
      timestamp: orderData.timestamp,
      date: orderData.date,
    };
    this.orders.push(order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.find(order => order.id === id);
    if (!order) return undefined;
    order.status = status;
    return order;
  }
}

export const storage = new MemoryStorage();