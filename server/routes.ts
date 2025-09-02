import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertMenuItemSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Simple session middleware for custom auth
function setupSession(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'restaurant-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
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
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.includes(file.mimetype);
    
    console.log('Upload attempt:', file.originalname, file.mimetype, 'Extension valid:', extname, 'Mime valid:', mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed'));
    }
  }
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  console.log('Auth check - Session:', req.session, 'UserId:', req.session?.userId);
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);
  
  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Get current user from session
  app.get("/api/auth/user", (req, res) => {
    if (!req.session || !(req.session as any).userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user info from session
    const userId = (req.session as any).userId;
    storage.getUserById(userId).then((user: any) => {
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const { password, ...userData } = user;
      res.json(userData);
    }).catch(() => {
      res.status(500).json({ message: "Server error" });
    });
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
      
      // Return user without password
      const { password: _, ...userData } = user;
      res.json({ user: userData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Signup removed - admin-only system

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
      
      if (!status || typeof status !== 'string') {
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

  // Menu management routes
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json({ menuItems });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Protected route - only authenticated users can create menu items
  app.post("/api/menu", requireAuth, upload.single('image'), async (req, res) => {
    try {
      console.log('Creating menu item:', req.body, 'File:', req.file);
      
      // Validation: Ensure image is provided for new items
      if (!req.file) {
        return res.status(400).json({ error: "Image is required for new menu items" });
      }
      
      const menuItemData = {
        ...req.body,
        imageUrl: `/uploads/${req.file.filename}`
      };
      
      const validatedData = insertMenuItemSchema.parse(menuItemData);
      const menuItem = await storage.createMenuItem(validatedData);
      res.status(201).json({ menuItem });
    } catch (error) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error('Menu creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Protected route - only authenticated users can update menu items
  app.put("/api/menu/:id", requireAuth, upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get existing menu item to handle image replacement
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ error: "Menu item not found" });
      }
      
      const menuItemData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : existingItem.imageUrl
      };
      
      const validatedData = insertMenuItemSchema.parse(menuItemData);
      const menuItem = await storage.updateMenuItem(id, validatedData);
      
      // Delete old image if a new one was uploaded
      if (req.file && existingItem.imageUrl) {
        const oldImagePath = path.join(process.cwd(), existingItem.imageUrl);
        fs.unlink(oldImagePath, () => {});
      }
      
      res.json({ menuItem });
    } catch (error) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Protected route - only authenticated users can delete menu items
  app.delete("/api/menu/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(id);
      if (!success) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
