import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        n.id, n.type, n.is_read, n.created_at,
        n.post_id,
        (SELECT media_url FROM post_media WHERE post_id = n.post_id ORDER BY position ASC LIMIT 1) as post_thumbnail,
        a.id as actor_id, a.username as actor_username, a.avatar_url as actor_avatar
      FROM notifications n
      JOIN users a ON a.id = n.actor_id
      WHERE n.recipient_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ notifications: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err) {
    console.error("Notificationlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE",
      [userId]
    );
    res.json({ message: "Barcha bildirishnomalar o'qilgan deb belgilandi." });
  } catch (err) {
    console.error("Notification yangilashda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      "SELECT COUNT(*)::int as count FROM notifications WHERE recipient_id = $1 AND is_read = FALSE",
      [userId]
    );
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error("Unread count olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
