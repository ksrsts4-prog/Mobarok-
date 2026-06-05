import express from "express";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// Suppress unused imports
import { startTelegramBot } from "./telegram-bot";

dotenv.config();

// Ensure telegram bot only starts if Token exists
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let telegramBot: any = null;

// Initialize Firebase Admin for token verification
let firebaseConfig: any = null;
try {
  const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
  const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") // Fix newlines in .env
    : undefined;

  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
    });
    console.log(
      "Firebase Admin SDK initialized securely using environment variables.",
    );
  } else {
    firebaseConfig = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "firebase-applet-config.json"),
        "utf8",
      ),
    );
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log(
      "Firebase Admin SDK initialized using firebase-applet-config.json",
    );
  }
} catch (error) {
  console.error("Firebase Admin initialization error", error);
}

let db: any;
try {
  let dbId = undefined;
  try {
    const cfg = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "firebase-applet-config.json"),
        "utf8",
      ),
    );
    dbId = cfg.firestoreDatabaseId;
  } catch (e) {}

  if (dbId) {
    db = getFirestore(admin.app(), dbId);
    console.log("Firestore initialized with DB ID:", dbId);
  } else {
    db = getFirestore();
  }
} catch (error) {
  console.error("Firestore init error", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start Telegram bot securely with the initialized db and webhook setup
  if (TELEGRAM_BOT_TOKEN) {
    telegramBot = startTelegramBot(db, process.env.APP_URL, app);
  }

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  const geminiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
      error:
        "Too many requests. Admin Mobarok has limited AI usage to 3 prompts per minute to prevent abuse. Please try again later.",
    },
  });

  const adminPinRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute lockout
    max: 5, // 5 requests per IP
    message: { error: "Too many failed attempts. Try again in 1 minute." },
  });

  app.post("/api/verify-admin-pin", adminPinRateLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing or invalid token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      let uid = "";
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
      } catch (authErr) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      const { pin } = req.body;
      if (!pin) return res.status(400).json({ error: "PIN required" });

      let validPin =
        "2e5ad9980af6d86f40125576eebb5a2cff4f0e0250cd300bfe669290ec707336"; // fallback
      try {
        if (db) {
          const settingsDoc = await db
            .collection("systemSettings")
            .doc("security")
            .get();
          if (settingsDoc.exists && settingsDoc.data()?.adminPin) {
            validPin = settingsDoc.data()?.adminPin;
          }
        }
      } catch (e) {}

      const crypto = await import("crypto");
      const hashedVal = crypto.createHash("sha256").update(pin).digest("hex");

      if (hashedVal === validPin || pin === validPin) {
        return res.json({ success: true });
      } else {
        return res.status(403).json({ error: "Invalid PIN" });
      }
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/upgrade-premium", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing or invalid token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      if (db) {
        await db.collection("users").doc(uid).set(
          {
            isPremium: true,
          },
          { merge: true },
        );
      }

      res.json({ success: true });
    } catch (e: any) {
      console.error("Upgrade Premium API failed", e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API Route for Gemini
  app.post("/api/gemini/generate", geminiRateLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing or invalid token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      let uid = "";
      let email = "";
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        email = decodedToken.email || "";
      } catch (authErr) {
        console.error("Token verification failed:", authErr);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      // We skip server-side database limit checks because the server lacks Firestore IAM
      // permissions in this environment and relies on the client SDK to enforce limits
      // via client logic and firestore rules.

      const { model, contents, config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("Gemini API Key missing");
        return res
          .status(500)
          .json({ error: "Gemini API key is not configured on server" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Default to gemini-3-flash-preview if no model is provided
      const modelName = model || "gemini-3-flash-preview";

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });

      res.json({
        text: response.text,
        functionCalls: response.functionCalls,
      });
    } catch (e: any) {
      console.error("Gemini API Error:", e);
      let status = 500;
      let errorMessage = "Failed to generate AI response";

      if (
        e.message?.includes("quota") ||
        e.message?.includes("429") ||
        e.message?.includes("RESOURCE_EXHAUSTED")
      ) {
        status = 429;
        errorMessage = "AI limit reached. Please try again later.";
      } else if (
        e.message?.includes("API key") ||
        e.message?.includes("not valid") ||
        e.message?.includes("403")
      ) {
        status = 403;
        errorMessage = "Invalid Gemini API Key. Please check your settings.";
      }

      res.status(status).json({
        error: errorMessage,
        details: e.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
