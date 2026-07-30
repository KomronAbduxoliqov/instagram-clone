import { Router } from "express";
import {
  toggleLike,
  getPostLikes,
  addComment,
  getComments,
  deleteComment,
  toggleSave,
  getSavedPosts,
  toggleCommentLike,
} from "../controllers/interactionController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/posts/:postId/like", requireAuth, toggleLike);
router.get("/posts/:postId/likes", requireAuth, getPostLikes);

router.post("/posts/:postId/comments", requireAuth, addComment);
router.get("/posts/:postId/comments", optionalAuth, getComments);
router.post("/comments/:commentId/like", requireAuth, toggleCommentLike);
router.delete("/comments/:commentId", requireAuth, deleteComment);

router.post("/posts/:postId/save", requireAuth, toggleSave);
router.get("/saved", requireAuth, getSavedPosts);

export default router;
