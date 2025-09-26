import { Router } from "express";
import { uploadProject, getProjects } from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);
router.get("/", getProjects);

export default router;