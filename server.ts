import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

console.log("Starting server initialization...");

let db: admin.firestore.Firestore | null = null;
let openai: OpenAI | null = null;

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    console.log("Initializing Firebase Admin...");
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle private key with escaped newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      db = admin.firestore();
      console.log("Firebase Admin and Firestore initialized.");
    } else {
      console.warn("Firebase Admin credentials missing. Firestore will not be available.");
    }
  } else {
    db = admin.firestore();
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

// Initialize OpenAI
try {
  console.log("Initializing OpenAI...");
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("OpenAI initialized.");
  } else {
    console.warn("OPENAI_API_KEY missing. Chat API will not be available.");
  }
} catch (error) {
  console.error("OpenAI initialization error:", error);
}

// Vite middleware setup
async function startServer() {
  console.log("Setting up server and Vite middleware...");
  
  app.use(express.json());

  // API Endpoint for Chat
  app.post("/api/chat", async (req, res) => {
    console.log("Received chat POST request:", req.body);
    const { slug, message, messages, prompt } = req.body;

    if (!openai) {
      console.warn("Service unavailable: openai not initialized.");
      return res.status(503).json({ error: "Service unavailable. OpenAI not configured." });
    }

    try {
      let systemPrompt = prompt;

      // Fallback to Firebase if prompt not provided by frontend
      if (!systemPrompt && db && slug) {
        const nichosRef = db.collection("nichos");
        const snapshot = await nichosRef.where("slug", "==", slug).limit(1).get();
        if (!snapshot.empty) {
          systemPrompt = snapshot.docs[0].data().prompt_inicial;
        }
      }

      if (!systemPrompt) {
        return res.status(400).json({ error: "System prompt is required." });
      }

      // Prepare messages for OpenAI
      const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
      
      if (messages && Array.isArray(messages)) {
        // Use provided history
        messages.forEach((msg: any) => {
          apiMessages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        });
      } else {
        // Fallback to single message
        apiMessages.push({ role: "user", content: message || "Olá!" });
      }

      console.log(`Calling OpenAI with ${apiMessages.length} messages`);
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: apiMessages,
      });

      const responseText = completion.choices[0].message.content;
      res.json({ response: responseText });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      firebase: !!db, 
      openai: !!openai,
      env: process.env.NODE_ENV 
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files middleware attached.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Unhandled error in startServer:", err);
});
