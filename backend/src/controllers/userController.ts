import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId || 0;

    const result = await pool.query(
      `SELECT
        u.id, u.username, u.full_name, u.bio, u.avatar_url, u.is_private, u.created_at,
        COUNT(DISTINCT p.id)::int as post_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND status = 'accepted')::int as follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id AND status = 'accepted')::int as following_count,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id AND status = 'accepted') as is_following,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id AND status = 'pending') as is_pending
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      WHERE u.username = $1
      GROUP BY u.id`,
      [username, currentUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Profil olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { full_name, bio, is_private } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        is_private = COALESCE($3, is_private),
        updated_at = NOW()
       WHERE id = $4
       RETURNING id, username, email, full_name, bio, avatar_url, is_private`,
      [full_name, bio, is_private, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Profil yangilashda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function updateAvatar(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Rasm yuklanmadi." });
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const result = await pool.query(
      "UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, avatar_url",
      [avatarUrl, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Avatar yangilashda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function removeAvatar(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      "UPDATE users SET avatar_url = NULL, updated_at = NOW() WHERE id = $1 RETURNING id, username, avatar_url",
      [userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Avatar o'chirishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function searchUsers(req: Request, res: Response) {
  try {
    const query = (req.query.q as string) || "";
    if (query.trim().length === 0) {
      return res.json({ users: [] });
    }

    const result = await pool.query(
      `SELECT id, username, full_name, avatar_url
       FROM users
       WHERE username ILIKE $1 OR full_name ILIKE $1
       ORDER BY username ASC
       LIMIT 20`,
      [`%${query}%`]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("Qidiruvda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

// ============ FOLLOW ============
export async function toggleFollow(req: Request, res: Response) {
  try {
    const followerId = req.user!.userId;
    const { username } = req.params;

    const targetResult = await pool.query("SELECT id, is_private FROM users WHERE username = $1", [username]);
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }
    const target = targetResult.rows[0];

    if (target.id === followerId) {
      return res.status(400).json({ error: "O'zingizni follow qila olmaysiz." });
    }

    const existing = await pool.query(
      "SELECT id, status FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, target.id]
    );

    if (existing.rows.length > 0) {
      await pool.query("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2", [followerId, target.id]);
      return res.json({ following: false, pending: false });
    }

    const status = target.is_private ? "pending" : "accepted";
    await pool.query(
      "INSERT INTO follows (follower_id, following_id, status) VALUES ($1, $2, $3)",
      [followerId, target.id, status]
    );

    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, type) VALUES ($1, $2, $3)`,
      [target.id, followerId, status === "pending" ? "follow_request" : "follow"]
    );

    res.json({ following: status === "accepted", pending: status === "pending" });
  } catch (err) {
    console.error("Follow xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getFollowers(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       JOIN users target ON target.id = f.following_id
       WHERE target.username = $1 AND f.status = 'accepted'
       ORDER BY f.created_at DESC`,
      [username]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Followerlarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.following_id
       JOIN users source ON source.id = f.follower_id
       WHERE source.username = $1 AND f.status = 'accepted'
       ORDER BY f.created_at DESC`,
      [username]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Followinglarni olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getSuggestedUsers(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    // Suggest users not currently followed by the user, not the user themselves
    const result = await pool.query(
      `SELECT id, username, full_name, avatar_url
       FROM users
       WHERE id != $1
         AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
       ORDER BY RANDOM()
       LIMIT 5`,
      [userId]
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("Suggested users olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function getFollowRequests(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT f.id, f.created_at, u.id as follower_id, u.username, u.full_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error("Follow requests olishda xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function acceptFollowRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { followId } = req.params;

    const result = await pool.query(
      "UPDATE follows SET status = 'accepted' WHERE id = $1 AND following_id = $2 AND status = 'pending' RETURNING follower_id",
      [followId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "So'rov topilmadi." });
    }

    const followerId = result.rows[0].follower_id;
    await pool.query(
      `INSERT INTO notifications (recipient_id, actor_id, type) VALUES ($1, $2, 'follow')`,
      [followerId, userId]
    );

    res.json({ message: "Qabul qilindi." });
  } catch (err) {
    console.error("Follow request accept xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function rejectFollowRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { followId } = req.params;

    const result = await pool.query(
      "DELETE FROM follows WHERE id = $1 AND following_id = $2 AND status = 'pending' RETURNING id",
      [followId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "So'rov topilmadi." });
    }

    res.json({ message: "Rad etildi." });
  } catch (err) {
    console.error("Follow request reject xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
