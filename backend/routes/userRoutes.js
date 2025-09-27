import { Router } from "express";
import { 
  getUserProfile,
  updateUserProfile,
  getUserRepos,
  updateUserRepos,
  getUserStats,
  updateUserPreferences,
  getUserIssues,
  getUserPullRequests
} from "../controllers/userController.js";

const router = Router();

// User routes
router.get("/:githubId", getUserProfile);
router.patch("/:githubId/profile", updateUserProfile);
router.get("/:githubId/repos", getUserRepos);
router.put("/:githubId/repos", updateUserRepos);
router.get("/:githubId/stats", getUserStats);
router.patch("/:githubId/preferences", updateUserPreferences);
router.get("/:githubId/issues", getUserIssues);
router.get("/:githubId/pull-requests", getUserPullRequests);

export default router;
