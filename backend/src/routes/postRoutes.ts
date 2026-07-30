import { Router } from "express";
import {
  createPost,
  getFeed,
  getExplore,
  getPostById,
  getUserPosts,
  deletePost,
  getReels,
  updatePost
} from "../controllers/postController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { uploadPostMedia } from "../middleware/upload.js";

const router = Router();

router.post("/", requireAuth, uploadPostMedia.array("media", 10), createPost);
router.get("/feed", requireAuth, getFeed);
router.get("/explore", optionalAuth, getExplore);
router.get("/reels", optionalAuth, getReels);
router.get("/user/:username", getUserPosts);
router.get("/:id", optionalAuth, getPostById);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
