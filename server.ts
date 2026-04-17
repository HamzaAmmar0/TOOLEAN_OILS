import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";

// In a fully deployed environment with service accounts, we would initialize firebase-admin:
// import * as admin from 'firebase-admin';
// admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // === AUTHENTICATION MIDDLEWARE (JWT) ===
  // This verifies the Firebase Authentication JWT sent from the client
  const verifyToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    // const token = authHeader.split('Bearer ')[1];
    try {
      // Real implementation checks signature natively via Google's public instances:
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // req.user = decodedToken;
      
      // For snippet simulation, we immediately pass the request forward.
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
  };

  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // In production, we'd check req.user.uid against the /users/ collection in Firestore for role == 'admin'
    // const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    // if (userDoc.data()?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  };

  // === API ROUTES ===

  // 1. Analytics (Admin)
  app.get("/api/analytics", verifyToken, requireAdmin, (req, res) => {
    res.json({
      status: "success",
      data: {
        totalVisits: 14205,
        totalSales: 48392.50,
        activeCarts: 342,
        topProducts: [
          { id: "1", name: "Botanical Argan No. 07", views: 420, conversions: "8.4%" },
          { id: "6", name: "Restorative Blend", views: 310, conversions: "5.1%" }
        ]
      }
    });
  });

  // 2. Products Management (CRUD)
  app.get("/api/products", (req, res) => {
    // Public path: Fetch all active products
    res.json({ status: "success", message: "Fetched products" });
  });

  app.post("/api/products", verifyToken, requireAdmin, (req, res) => {
    // Admin path: Create new product
    const { name, price, images, categories, stock, discountRate } = req.body;
    if (!name || !price) return res.status(400).json({ error: "Missing required fields" });
    
    // admin.firestore().collection('products').add({...})
    res.status(201).json({ status: "success", message: "Product created successfully", productId: "PRD-NEW-88" });
  });

  // 3. Orders Management
  app.post("/api/orders", verifyToken, (req, res) => {
    // User path: Placing a checkout order from the cart
    const { items, paymentIntentId } = req.body;
    
    // 1. Verify Payment
    // 2. Deplete Stock transactionally via Firestore Batches
    // 3. Write /orders/{orderId}
    res.status(201).json({ status: "success", message: "Order processed successfully" });
  });

  // === VITE MIDDLEWARE FOR DEVELOPMENT & SPA FALLBACK ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
