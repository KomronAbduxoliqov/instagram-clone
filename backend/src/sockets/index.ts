import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import { pool } from "../db/pool.js";

// userId -> socketId(lar) xaritasi (bitta user bir nechta tabda ochishi mumkin)
const onlineUsers = new Map<number, Set<string>>();

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Har bir ulanishda JWT tokenni tekshiramiz
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.cookie
          ?.split("; ")
          .find((c) => c.startsWith("token="))
          ?.split("=")[1];

      if (!token) return next(new Error("Token topilmadi"));

      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Token yaroqsiz"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    // Userni o'z shaxsiy "xonasi"ga qo'shamiz - notification yuborish oson bo'ladi
    socket.join(`user:${userId}`);

    io.emit("user:online", { userId });

    // Suhbat xonasiga qo'shilish
    socket.on("conversation:join", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Xabar yuborish
    socket.on("message:send", async (data: { conversationId: number; content?: string; mediaUrl?: string }) => {
      try {
        const isParticipant = await pool.query(
          "SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
          [data.conversationId, userId]
        );
        if (isParticipant.rows.length === 0) return;

        const result = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, content, media_url) VALUES ($1, $2, $3, $4) RETURNING *`,
          [data.conversationId, userId, data.content?.trim() || null, data.mediaUrl || null]
        );

        const userResult = await pool.query(
          "SELECT username, avatar_url FROM users WHERE id = $1",
          [userId]
        );

        const fullMessage = {
          ...result.rows[0],
          sender_username: userResult.rows[0].username,
          sender_avatar: userResult.rows[0].avatar_url,
        };

        io.to(`conversation:${data.conversationId}`).emit("message:new", fullMessage);
      } catch (err) {
        console.error("Socket xabar yuborishda xatolik:", err);
        socket.emit("message:error", { error: "Xabar yuborilmadi." });
      }
    });

    // Typing indicator
    socket.on("typing:start", (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId, conversationId });
    });

    socket.on("typing:stop", (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId, conversationId });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("user:offline", { userId });
        }
      }
    });
  });

  return io;
}

export function isUserOnline(userId: number): boolean {
  return onlineUsers.has(userId);
}
