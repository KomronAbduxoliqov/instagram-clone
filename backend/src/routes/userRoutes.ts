import { Router } from "express";
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  searchUsers,
  toggleFollow,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../controllers/userController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = Router();

router.get("/search", searchUsers);
router.put("/me/profile", requireAuth, updateProfile);
router.put("/me/avatar", requireAuth, uploadAvatar.single("avatar"), updateAvatar);
router.delete("/me/avatar", requireAuth, removeAvatar);

router.get("/suggested", requireAuth, getSuggestedUsers);

router.get("/me/follow-requests", requireAuth, getFollowRequests);
router.post("/me/follow-requests/:followId/accept", requireAuth, acceptFollowRequest);
router.delete("/me/follow-requests/:followId/reject", requireAuth, rejectFollowRequest);

router.get("/:username", optionalAuth, getUserProfile);
router.post("/:username/follow", requireAuth, toggleFollow);
router.get("/:username/followers", getFollowers);
router.get("/:username/following", getFollowing);

export default router;
