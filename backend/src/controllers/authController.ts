import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { signToken } from "../utils/jwt.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
};

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email va parol majburiy." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." });
    }
    if (!/^[a-zA-Z0-9._]{3,30}$/.test(username)) {
      return res.status(400).json({ error: "Username faqat harf, raqam, nuqta va pastki chiziqdan iborat bo'lishi mumkin (3-30 belgi)." });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Bu username yoki email allaqachon band." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, full_name, bio, avatar_url, is_private, created_at`,
      [username, email, passwordHash, full_name || null]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id, username: user.username });

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Login ma'lumotlari va parol kiritilishi shart." });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri." });
    }

    const token = signToken({ userId: user.id, username: user.username });
    res.cookie("token", token, COOKIE_OPTIONS);

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ message: "Muvaffaqiyatli chiqildi." });
}

export async function getMe(req: Request, res: Response) {
  try {
    const result = await pool.query(
      "SELECT id, username, email, full_name, bio, avatar_url, is_private, created_at FROM users WHERE id = $1",
      [req.user!.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("GetMe xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { emailOrUsername, newPassword } = req.body;

    if (!emailOrUsername || !newPassword) {
      return res.status(400).json({ error: "Foydalanuvchi nomi/email va yangi parol kiritilishi shart." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $1",
      [emailOrUsername]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
    }

    const userId = userResult.rows[0].id;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, userId]
    );

    res.json({ message: "Parol muvaffaqiyatli o'zgartirildi. Endi yangi parol bilan tizimga kiring." });
  } catch (err) {
    console.error("ResetPassword xatolik:", err);
    res.status(500).json({ error: "Server xatoligi yuz berdi." });
  }
}
