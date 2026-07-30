import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

// Story yaratish
export async function createStory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Rasm yoki video yuklash kerak." });
    }

    const mediaType = file.mimetype.startsWith("video") ? "video" : "image";
    const mediaUrl = `/uploads/stories/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO stories (user_id, media_url, media_type) VALUES ($1, $2, $3) RETURNING *`,
      [userId, mediaUrl, mediaType]
    );

    res.status(201).json({ story: result.rows[0] });
  } catch (err) {
    console.error("Story yaratishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Feed uchun: follow qilingan userlarning aktiv (muddati o'tmagan) stories, userlar bo'yicha guruhlangan
export async function getStoriesFeed(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT
        u.id as user_id, u.username, u.avatar_url,
        json_agg(
          jsonb_build_object(
            'id', s.id, 'media_url', s.media_url, 'media_type', s.media_type,
            'created_at', s.created_at, 'expires_at', s.expires_at,
            'viewed_by_me', EXISTS(SELECT 1 FROM story_views WHERE story_id = s.id AND viewer_id = $1)
          ) ORDER BY s.created_at ASC
        ) as stories
      FROM stories s
      JOIN users u ON u.id = s.user_id
      WHERE s.expires_at > NOW()
        AND (
          s.user_id = $1
          OR s.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1 AND status = 'accepted')
        )
      GROUP BY u.id
      ORDER BY MIN(s.created_at) DESC`,
      [userId]
    );

    res.json({ storyGroups: result.rows });
  } catch (err) {
    console.error("Stories feed olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function viewStory(req: Request, res: Response) {
  try {
    const viewerId = req.user!.userId;
    const { storyId } = req.params;

    await pool.query(
      `INSERT INTO story_views (story_id, viewer_id) VALUES ($1, $2)
       ON CONFLICT (story_id, viewer_id) DO NOTHING`,
      [storyId, viewerId]
    );

    res.json({ viewed: true });
  } catch (err) {
    console.error("Story ko'rishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getStoryViewers(req: Request, res: Response) {
  try {
    const { storyId } = req.params;
    const userId = req.user!.userId;

    // Faqat story egasi ko'rganlar ro'yxatini ko'ra oladi
    const story = await pool.query("SELECT user_id FROM stories WHERE id = $1", [storyId]);
    if (story.rows.length === 0) {
      return res.status(404).json({ error: "Story topilmadi." });
    }
    if (story.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Bu ma'lumotni ko'rish huquqingiz yo'q." });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url, sv.viewed_at
       FROM story_views sv
       JOIN users u ON u.id = sv.viewer_id
       WHERE sv.story_id = $1
       ORDER BY sv.viewed_at DESC`,
      [storyId]
    );

    res.json({ viewers: result.rows });
  } catch (err) {
    console.error("Story viewerlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function deleteStory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { storyId } = req.params;

    const result = await pool.query(
      "DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING id",
      [storyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Story topilmadi yoki o'chirishga ruxsatingiz yo'q." });
    }

    res.json({ message: "Story o'chirildi." });
  } catch (err) {
    console.error("Story o'chirishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// ============ HIGHLIGHTS ============
export async function createHighlight(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const userId = req.user!.userId;
    const { title, items } = req.body; // items: [{media_url, media_type}, ...]
    
    if (!title) return res.status(400).json({ error: "Highlight nomi bo'lishi shart." });
    if (!items || !items.length) return res.status(400).json({ error: "Kamida bitta element tanlang." });

    await client.query("BEGIN");
    
    const coverUrl = items[0].media_url; // Use first item as cover
    const hlResult = await client.query(
      `INSERT INTO highlights (user_id, title, cover_url) VALUES ($1, $2, $3) RETURNING *`,
      [userId, title, coverUrl]
    );
    const highlight = hlResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO highlight_items (highlight_id, media_url, media_type) VALUES ($1, $2, $3)`,
        [highlight.id, item.media_url, item.media_type]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ highlight });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Highlight yaratishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  } finally {
    client.release();
  }
}

export async function getHighlights(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User topilmadi." });
    
    const targetUserId = userResult.rows[0].id;

    const result = await pool.query(
      `SELECT h.id, h.title, h.cover_url, h.created_at,
        (
          SELECT json_agg(jsonb_build_object('id', hi.id, 'media_url', hi.media_url, 'media_type', hi.media_type))
          FROM highlight_items hi WHERE hi.highlight_id = h.id
        ) as items
       FROM highlights h
       WHERE h.user_id = $1
       ORDER BY h.created_at DESC`,
      [targetUserId]
    );

    res.json({ highlights: result.rows });
  } catch (err) {
    console.error("Highlights olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
