import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import MemoryStore from "memorystore";

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);

// Simple session middleware for custom auth
function setupSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'restaurant-secret-key-change-in-production',
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)'));
    }
  }
});

// Zod schemas for validation
const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const insertOrderSchema = z.object({
  tableNumber: z.number(),
  customerName: z.string().min(1),
  items: z.string(),
  total: z.string(),
  status: z.string().optional(),
  timestamp: z.string(),
  date: z.string(),
});

const insertMenuItemSchema = z.object({
  name: z.string().min(1),
  price: z.string(),
  category: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().optional(),
});

// Auth middleware
const requireAuth = async (req: any, res: any, next: any) => {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // User route to get current authenticated user
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    const user = req.user;
    const { password, ...userData } = user;
    res.json(userData);
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Store user ID in session
      (req.session as any).userId = user.id;
      console.log('Login successful, session userId:', (req.session as any).userId);
      
      // Return user data
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
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Order management routes (public for customer access)
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

  // Protected route - only authenticated users can update order status
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

  // Menu management routes (protected)
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json({ menuItems });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/menu", requireAuth, upload.single('image'), async (req, res) => {
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
        imageUrl,
      };

      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json({ menuItem });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/menu/:id", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, price, category, description } = req.body;
      
      if (!name || !price || !category || !description) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Get existing item to preserve image if no new image uploaded
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
        imageUrl,
      };

      const menuItem = await storage.updateMenuItem(id, menuItemData);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      res.json({ menuItem });
    } catch (error) {
      console.error('Error updating menu item:', error);
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