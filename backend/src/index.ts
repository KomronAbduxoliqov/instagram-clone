import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

import { testConnection } from "./db/pool.js";
import { setupSocket } from "./sockets/index.js";
import { startCleanupJobs } from "./utils/cleanup.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

// ============ MIDDLEWARE ============
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Yuklangan fayllarni statik xizmat qilish
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", interactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler for API routes
app.use("/api/*path", (req, res) => {
  res.status(404).json({ error: `Yo'l topilmadi: ${req.method} ${req.path}` });
});

// Frontend dist fayllarini serve qilish
const frontendDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(frontendDistPath));

// Barcha boshqa so'rovlarni frontend index.html ga yo'naltirish (React Router uchun)
app.get("*path", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global xatolik:", err);
  if (err.message?.includes("Faqat rasm")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Kutilmagan server xatoligi." });
});

// ============ SOCKET.IO ============
setupSocket(httpServer);

// ============ SERVER START ============
const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  startCleanupJobs();
  httpServer.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} manzilida ishga tushdi`);
  });
}

start();
