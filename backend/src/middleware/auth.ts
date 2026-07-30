import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Token ikkita joydan kelishi mumkin: cookie yoki Authorization header
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring." });
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token yaroqsiz yoki muddati tugagan." });
  }
}

// Ba'zi endpointlar login bo'lmasa ham ishlaydi, lekin login bo'lsa user ma'lumotini qo'shadi
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = tokenFromCookie || tokenFromHeader;
    if (token) {
      req.user = verifyToken(token);
    }
  } catch {
    // Token yaroqsiz bo'lsa ham davom etamiz, faqat user bo'sh qoladi
  }
  next();
}
