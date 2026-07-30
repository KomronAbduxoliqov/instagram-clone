import { Router } from "express";
import {
  createStory,
  getStoriesFeed,
  viewStory,
  getStoryViewers,
  deleteStory,
  createHighlight,
  getHighlights
} from "../controllers/storyController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadStoryMedia } from "../middleware/upload.js";

const router = Router();

router.post("/", requireAuth, uploadStoryMedia.single("media"), createStory);
router.get("/feed", requireAuth, getStoriesFeed);
router.post("/:storyId/view", requireAuth, viewStory);
router.get("/:storyId/viewers", requireAuth, getStoryViewers);
router.delete("/:storyId", requireAuth, deleteStory);

// Highlights
router.post("/highlights", requireAuth, createHighlight);
router.get("/highlights/:username", getHighlights);

export default router;
