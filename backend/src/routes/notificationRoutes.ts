import { Router } from "express";
import { getNotifications, markAllRead, getUnreadCount } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.put("/mark-read", requireAuth, markAllRead);

export default router;
