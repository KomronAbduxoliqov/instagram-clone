import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

// Foydalanuvchining barcha suhbatlari ro'yxati
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT
        c.id, c.is_group, c.group_name, c.created_at,
        (
          SELECT json_agg(jsonb_build_object('id', u.id, 'username', u.username, 'avatar_url', u.avatar_url))
          FROM conversation_participants cp2
          JOIN users u ON u.id = cp2.user_id
          WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
        ) as participants,
        (
          SELECT jsonb_build_object('content', m.content, 'sender_id', m.sender_id, 'created_at', m.created_at)
          FROM messages m WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)::int FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND NOT EXISTS (SELECT 1 FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = $1)
        ) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.user_id = $1
      ORDER BY (SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id) DESC NULLS LAST`,
      [userId]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error("Suhbatlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Ikki user orasidagi suhbatni topish, bo'lmasa yaratish
export async function getOrCreateConversation(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const userId = req.user!.userId;
    const { username } = req.body;

    const targetResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }
    const targetId = targetResult.rows[0].id;

    if (targetId === userId) {
      return res.status(400).json({ error: "O'zingiz bilan suhbat ochib bo'lmaydi." });
    }

    // Mavjud 1-1 suhbatni qidiramiz
    const existing = await pool.query(
      `SELECT c.id FROM conversations c
       WHERE c.is_group = FALSE
         AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = $1)
         AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = c.id AND user_id = $2)
         AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) = 2`,
      [userId, targetId]
    );

    if (existing.rows.length > 0) {
      return res.json({ conversationId: existing.rows[0].id, created: false });
    }

    await client.query("BEGIN");
    const convResult = await client.query(
      "INSERT INTO conversations (is_group) VALUES (FALSE) RETURNING id"
    );
    const conversationId = convResult.rows[0].id;

    await client.query(
      "INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)",
      [conversationId, userId, targetId]
    );
    await client.query("COMMIT");

    res.status(201).json({ conversationId, created: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Suhbat yaratishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  } finally {
    client.release();
  }
}

// Suhbatdagi xabarlar tarixi
export async function getMessages(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 30;
    const offset = (page - 1) * limit;

    const isParticipant = await pool.query(
      "SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );
    if (isParticipant.rows.length === 0) {
      return res.status(403).json({ error: "Bu suhbatga kirish huquqingiz yo'q." });
    }

    const result = await pool.query(
      `SELECT m.id, m.content, m.media_url, m.created_at, m.sender_id,
        u.username as sender_username, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );

    res.json({ messages: result.rows.reverse(), page, hasMore: result.rows.length === limit });
  } catch (err) {
    console.error("Xabarlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Oddiy REST orqali xabar yuborish (Socket.io asosiy real-time uchun ishlatiladi,
// lekin REST fallback ham foydali - masalan birinchi xabar yuborilganda yoki media bilan)
export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const { content } = req.body;
    const file = req.file;

    if ((!content || content.trim().length === 0) && !file) {
      return res.status(400).json({ error: "Xabar matni yoki rasm/video bo'lishi shart." });
    }

    const isParticipant = await pool.query(
      "SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );
    if (isParticipant.rows.length === 0) {
      return res.status(403).json({ error: "Bu suhbatga xabar yuborish huquqingiz yo'q." });
    }

    let mediaUrl = null;
    if (file) {
      mediaUrl = `/uploads/messages/${file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, media_url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversationId, userId, content?.trim() || null, mediaUrl]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error("Xabar yuborishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;

    const isParticipant = await pool.query(
      "SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );
    if (isParticipant.rows.length === 0) {
      return res.status(403).json({ error: "Bu suhbatga kirish huquqingiz yo'q." });
    }

    const unreadMessages = await pool.query(
      `SELECT id FROM messages 
       WHERE conversation_id = $1 
         AND sender_id != $2 
         AND NOT EXISTS (SELECT 1 FROM message_reads WHERE message_id = messages.id AND user_id = $2)`,
      [conversationId, userId]
    );

    for (const msg of unreadMessages.rows) {
      await pool.query(
        "INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [msg.id, userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Xabarlarni o'qilgan qilib belgilashda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

