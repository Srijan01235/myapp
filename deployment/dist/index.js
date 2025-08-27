// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemoryStorage = class {
  users = [];
  menuItems = [];
  orders = [];
  nextUserId = 1;
  nextMenuItemId = 1;
  nextOrderId = 1;
  constructor() {
    this.initializeDefaultData();
  }
  initializeDefaultData() {
    this.users.push({
      id: this.nextUserId++,
      username: "admin",
      email: "admin@restaurant.com",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const defaultMenuItems = [
      { name: "Margherita Pizza", price: "12.99", category: "Pizza", description: "Fresh tomato sauce, mozzarella, basil", imageUrl: void 0 },
      { name: "Chicken Caesar Salad", price: "9.99", category: "Salads", description: "Grilled chicken, romaine, parmesan, croutons", imageUrl: void 0 },
      { name: "Beef Burger", price: "14.99", category: "Burgers", description: "Angus beef patty, lettuce, tomato, onion", imageUrl: void 0 },
      { name: "Pasta Carbonara", price: "13.99", category: "Pasta", description: "Spaghetti with eggs, cheese, pancetta", imageUrl: void 0 },
      { name: "Fish & Chips", price: "16.99", category: "Main Course", description: "Beer battered cod with fries", imageUrl: void 0 },
      { name: "Chocolate Cake", price: "6.99", category: "Desserts", description: "Rich chocolate layer cake", imageUrl: void 0 },
      { name: "Coca Cola", price: "2.99", category: "Beverages", description: "Classic cola drink", imageUrl: void 0 },
      { name: "Coffee", price: "3.99", category: "Beverages", description: "Freshly brewed coffee", imageUrl: void 0 }
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
  async getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }
  async createUser(userData) {
    const user = {
      id: this.nextUserId++,
      username: userData.username,
      email: userData.email,
      mobile: userData.mobile,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.push(user);
    return user;
  }
  async authenticateUser(username, password) {
    if (username === "admin" && password === "admin123") {
      return this.users.find((user) => user.username === "admin") || null;
    }
    return null;
  }
  // Menu operations
  async getMenuItem(id) {
    return this.menuItems.find((item) => item.id === id);
  }
  async getAllMenuItems() {
    return [...this.menuItems];
  }
  async createMenuItem(menuItemData) {
    const menuItem = {
      id: this.nextMenuItemId++,
      name: menuItemData.name,
      price: menuItemData.price,
      category: menuItemData.category,
      description: menuItemData.description,
      imageUrl: menuItemData.imageUrl
    };
    this.menuItems.push(menuItem);
    return menuItem;
  }
  async updateMenuItem(id, menuItemData) {
    const index = this.menuItems.findIndex((item) => item.id === id);
    if (index === -1) return void 0;
    this.menuItems[index] = {
      ...this.menuItems[index],
      name: menuItemData.name,
      price: menuItemData.price,
      category: menuItemData.category,
      description: menuItemData.description,
      imageUrl: menuItemData.imageUrl
    };
    return this.menuItems[index];
  }
  async deleteMenuItem(id) {
    const index = this.menuItems.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.menuItems.splice(index, 1);
    return true;
  }
  // Order operations
  async getOrder(id) {
    return this.orders.find((order) => order.id === id);
  }
  async getAllOrders() {
    return [...this.orders];
  }
  async createOrder(orderData) {
    const order = {
      id: this.nextOrderId++,
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || "pending",
      timestamp: orderData.timestamp,
      date: orderData.date
    };
    this.orders.push(order);
    return order;
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.find((order2) => order2.id === id);
    if (!order) return void 0;
    order.status = status;
    return order;
  }
};
var storage = new MemoryStorage();

// server/routes.ts
import { z } from "zod";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import MemoryStore from "memorystore";
var MemoryStoreSession = MemoryStore(session);
function setupSession(app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "restaurant-secret-key-change-in-production",
    store: new MemoryStoreSession({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
}
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "menu-item-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === "image/svg+xml";
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)"));
    }
  }
});
var loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});
var insertOrderSchema = z.object({
  tableNumber: z.number(),
  customerName: z.string().min(1),
  items: z.string(),
  total: z.string(),
  status: z.string().optional(),
  timestamp: z.string(),
  date: z.string()
});
var insertMenuItemSchema = z.object({
  name: z.string().min(1),
  price: z.string(),
  category: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().optional()
});
var requireAuth = async (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = user;
  next();
};
async function registerRoutes(app) {
  setupSession(app);
  app.use("/uploads", express.static(uploadsDir));
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    const user = req.user;
    const { password, ...userData } = user;
    res.json(userData);
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginUserSchema.parse(req.body);
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      req.session.userId = user.id;
      console.log("Login successful, session userId:", req.session.userId);
      const userData = { ...user };
      res.json({ user: userData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json({ order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ order });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json({ menuItems });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/menu", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const { name, price, category, description } = req.body;
      if (!name || !price || !category || !description) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const menuItemData = {
        name,
        price,
        category,
        description,
        imageUrl
      };
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json({ menuItem });
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.put("/api/menu/:id", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, price, category, description } = req.body;
      if (!name || !price || !category || !description) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingItem.imageUrl;
      const menuItemData = {
        name,
        price,
        category,
        description,
        imageUrl
      };
      const menuItem = await storage.updateMenuItem(id, menuItemData);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json({ menuItem });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.delete("/api/menu/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(id);
      if (!success) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}

// server/index.ts
import { fileURLToPath } from "url";
import path2 from "path";
async function startServer() {
  const app = express2();
  const __dirname = path2.dirname(fileURLToPath(import.meta.url));
  app.use(express2.json());
  app.use(express2.urlencoded({ extended: true }));
  if (process.env.NODE_ENV === "production") {
    const staticPath = path2.join(__dirname, "public");
    app.use(express2.static(staticPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path2.join(staticPath, "index.html"));
    });
  }
  const server = await registerRoutes(app);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createServer2 } = await import("vite");
    const vite = await createServer2({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.ssrFixStacktrace);
    app.use("*", vite.middlewares);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}
startServer().catch(console.error);
