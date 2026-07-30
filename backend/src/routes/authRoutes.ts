import { Router } from "express";
import { register, login, logout, getMe, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);

export default router;
