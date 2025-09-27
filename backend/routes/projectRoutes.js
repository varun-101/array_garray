import { Router } from "express";
import { uploadProject, getProjects, getProjectById, submitFeedback, updateDeployedUrl } from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/feedback", submitFeedback);
router.patch("/:id/deployed-url", updateDeployedUrl);
export default router;