import { Router } from "express";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadMessageMedia } from "../middleware/upload.js";

const router = Router();

router.get("/conversations", requireAuth, getConversations);
router.post("/conversations", requireAuth, getOrCreateConversation);
router.get("/conversations/:conversationId/messages", requireAuth, getMessages);
router.post("/conversations/:conversationId/messages", requireAuth, uploadMessageMedia.single("media"), sendMessage);
router.post("/conversations/:conversationId/read", requireAuth, markAsRead);
router.post("/upload-media", requireAuth, uploadMessageMedia.single("media"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fayl yuklanmadi." });
  res.json({ media_url: `/uploads/messages/${req.file.filename}` });
});

export default router;
