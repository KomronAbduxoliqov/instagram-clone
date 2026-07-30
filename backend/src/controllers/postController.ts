import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

// Post yaratish (bir nechta rasm/video bilan)
export async function createPost(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const userId = req.user!.userId;
    const { caption, location, is_reel } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Kamida bitta rasm yoki video yuklash kerak." });
    }

    const isReel = is_reel === "true" || is_reel === true;

    await client.query("BEGIN");

    const postResult = await client.query(
      `INSERT INTO posts (user_id, caption, location, is_reel) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, caption || null, location || null, isReel]
    );
    const post = postResult.rows[0];

    const mediaRows = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaType = file.mimetype.startsWith("video") ? "video" : "image";
      const mediaUrl = `/uploads/posts/${file.filename}`;
      const mediaResult = await client.query(
        `INSERT INTO post_media (post_id, media_url, media_type, position)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [post.id, mediaUrl, mediaType, i]
      );
      mediaRows.push(mediaResult.rows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({ post: { ...post, media: mediaRows } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Post yaratishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  } finally {
    client.release();
  }
}

// Feed: o'zi follow qilgan userlarning postlari + o'zining postlari
export async function getFeed(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        p.id, p.caption, p.location, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pm.id, 'media_url', pm.media_url, 'media_type', pm.media_type, 'position', pm.position
        )) FILTER (WHERE pm.id IS NOT NULL), '[]') as media,
        COUNT(DISTINCT l.id)::int as like_count,
        COUNT(DISTINCT c.id)::int as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_me,
        EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = $1) as saved_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_media pm ON pm.post_id = p.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.user_id = $1
         OR p.user_id IN (
           SELECT following_id FROM follows WHERE follower_id = $1 AND status = 'accepted'
         )
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ posts: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err) {
    console.error("Feed olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Explore: barcha postlar (eng ko'p like olganlar birinchi)
export async function getExplore(req: Request, res: Response) {
  try {
    const userId = req.user?.userId || 0;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 21;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        p.id, p.caption, p.created_at,
        u.username, u.avatar_url,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pm.id, 'media_url', pm.media_url, 'media_type', pm.media_type, 'position', pm.position
        )) FILTER (WHERE pm.id IS NOT NULL), '[]') as media,
        COUNT(DISTINCT l.id)::int as like_count,
        COUNT(DISTINCT c.id)::int as comment_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_media pm ON pm.post_id = p.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE u.is_private = FALSE OR p.user_id = $1
      GROUP BY p.id, u.id
      ORDER BY like_count DESC, p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ posts: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err) {
    console.error("Explore olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Bitta postni to'liq ma'lumot bilan olish
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 0;

    const result = await pool.query(
      `SELECT
        p.id, p.caption, p.location, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pm.id, 'media_url', pm.media_url, 'media_type', pm.media_type, 'position', pm.position
        )) FILTER (WHERE pm.id IS NOT NULL), '[]') as media,
        COUNT(DISTINCT l.id)::int as like_count,
        COUNT(DISTINCT c.id)::int as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) as liked_by_me,
        EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = $2) as saved_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_media pm ON pm.post_id = p.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, u.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi." });
    }

    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error("Post olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Userning barcha postlari (profil sahifasi uchun, grid ko'rinishida)
export async function getUserPosts(req: Request, res: Response) {
  try {
    const { username } = req.params;

    const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }
    const targetUserId = userResult.rows[0].id;

    const result = await pool.query(
      `SELECT
        p.id, p.created_at,
        (SELECT media_url FROM post_media WHERE post_id = p.id ORDER BY position ASC LIMIT 1) as cover_media,
        (SELECT media_type FROM post_media WHERE post_id = p.id ORDER BY position ASC LIMIT 1) as cover_type,
        COUNT(DISTINCT pm.id)::int as media_count,
        COUNT(DISTINCT l.id)::int as like_count,
        COUNT(DISTINCT c.id)::int as comment_count
      FROM posts p
      LEFT JOIN post_media pm ON pm.post_id = p.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [targetUserId]
    );

    res.json({ posts: result.rows });
  } catch (err) {
    console.error("User postlarini olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi yoki uni o'chirishga ruxsatingiz yo'q." });
    }

    res.json({ message: "Post o'chirildi." });
  } catch (err) {
    console.error("Post o'chirishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { caption, location } = req.body;

    const result = await pool.query(
      "UPDATE posts SET caption = $1, location = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *",
      [caption, location, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post topilmadi yoki uni tahrirlashga ruxsatingiz yo'q." });
    }

    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error("Post yangilashda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// Reels: faqata is_reel = true bo'lgan video postlar
export async function getReels(req: Request, res: Response) {
  try {
    const userId = req.user?.userId || 0;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
        p.id, p.caption, p.created_at,
        u.id as user_id, u.username, u.avatar_url,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', pm.id, 'media_url', pm.media_url, 'media_type', pm.media_type, 'position', pm.position
        )) FILTER (WHERE pm.id IS NOT NULL), '[]') as media,
        COUNT(DISTINCT l.id)::int as like_count,
        COUNT(DISTINCT c.id)::int as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_me,
        EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = $1) as saved_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_media pm ON pm.post_id = p.id
      LEFT JOIN likes l ON l.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.is_reel = TRUE AND u.is_private = FALSE
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ posts: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err) {
    console.error("Reels olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
