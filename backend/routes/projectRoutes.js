import { Router } from "express";
import { uploadProject, getProjects, getProjectById, submitFeedback } from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/:id/feedback", submitFeedback);
export default router;