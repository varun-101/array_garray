import { Router } from "express";
import { 
  uploadProject, 
  getProjects, 
  getProjectById, 
  submitFeedback, 
  updateDeployedUrl,
  adoptProject,
  respondToInvitation,
  getCollaborationStatus,
  syncGitHubCollaborationStatus,
  getProjectCommits
} from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/feedback", submitFeedback);
router.patch("/:id/deployed-url", updateDeployedUrl);
router.post("/:id/adopt", adoptProject);
router.patch("/:id/collaboration", respondToInvitation);
router.get("/:id/collaboration-status", getCollaborationStatus);
router.get("/:id/sync-github-status", syncGitHubCollaborationStatus);
router.post("/:id/commits", getProjectCommits);
export default router;