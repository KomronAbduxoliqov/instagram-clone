import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

// ============ LIKES ============
export async function toggleLike(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { postId } = req.params;

    const existing = await pool.query(
      "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [userId, postId]);
      return res.json({ liked: false });
    }

    await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userId, postId]);

    // Notification yaratish (post egasiga, agar o'zi bo'lmasa)
    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (post.rows.length > 0 && post.rows[0].user_id !== userId) {
      await pool.query(
        `INSERT INTO notifications (recipient_id, actor_id, type, post_id) VALUES ($1, $2, 'like', $3)`,
        [post.rows[0].user_id, userId, postId]
      );
    }

    res.json({ liked: true });
  } catch (err) {
    console.error("Like xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getPostLikes(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM likes l JOIN users u ON u.id = l.user_id
       WHERE l.post_id = $1 ORDER BY l.created_at DESC`,
      [postId]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Like ro'yxatini olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// ============ COMMENTS ============
export async function addComment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { postId } = req.params;
    const { content, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Izoh matni bo'sh bo'lishi mumkin emas." });
    }
    if (content.length > 500) {
      return res.status(400).json({ error: "Izoh 500 belgidan oshmasligi kerak." });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, parent_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [postId, userId, parentId || null, content.trim()]
    );

    const comment = result.rows[0];
    const userResult = await pool.query(
      "SELECT username, avatar_url FROM users WHERE id = $1",
      [userId]
    );

    const post = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (post.rows.length > 0 && post.rows[0].user_id !== userId) {
      await pool.query(
        `INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id)
         VALUES ($1, $2, 'comment', $3, $4)`,
        [post.rows[0].user_id, userId, postId, comment.id]
      );
    }

    res.status(201).json({ comment: { ...comment, ...userResult.rows[0] } });
  } catch (err) {
    console.error("Izoh qo'shishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getComments(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const userId = req.user?.userId || 0;

    const result = await pool.query(
      `SELECT c.id, c.content, c.parent_id, c.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COUNT(cl.id)::int as like_count,
        EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $2) as liked_by_me
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN comment_likes cl ON cl.comment_id = c.id
       WHERE c.post_id = $1
       GROUP BY c.id, u.id
       ORDER BY c.created_at ASC`,
      [postId, userId]
    );

    res.json({ comments: result.rows });
  } catch (err) {
    console.error("Izohlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { commentId } = req.params;

    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id",
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Izoh topilmadi yoki uni o'chirishga ruxsatingiz yo'q." });
    }

    res.json({ message: "Izoh o'chirildi." });
  } catch (err) {
    console.error("Izoh o'chirishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// ============ SAVED POSTS ============
export async function toggleCommentLike(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { commentId } = req.params;

    const existing = await pool.query(
      "SELECT id FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
      [userId, commentId]
    );

    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2", [userId, commentId]);
      return res.json({ liked: false });
    }

    await pool.query("INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)", [userId, commentId]);
    res.json({ liked: true });
  } catch (err) {
    console.error("Comment Like xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// ============ SAVED POSTS ============
export async function toggleSave(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { postId } = req.params;

    const existing = await pool.query(
      "SELECT id FROM saved_posts WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2", [userId, postId]);
      return res.json({ saved: false });
    }

    await pool.query("INSERT INTO saved_posts (user_id, post_id) VALUES ($1, $2)", [userId, postId]);
    res.json({ saved: true });
  } catch (err) {
    console.error("Save xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getSavedPosts(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT p.id, p.created_at,
        (SELECT media_url FROM post_media WHERE post_id = p.id ORDER BY position ASC LIMIT 1) as cover_media
       FROM saved_posts sp
       JOIN posts p ON p.id = sp.post_id
       WHERE sp.user_id = $1
       ORDER BY sp.created_at DESC`,
      [userId]
    );
    res.json({ posts: result.rows });
  } catch (err) {
    console.error("Saqlangan postlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
