import { Router } from "express";
import { uploadProject, getProjects, getProjectById } from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

export default router;