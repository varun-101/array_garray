import { Router } from "express";
import { uploadProject } from "../controllers/projectController.js";

const router = Router();

router.post("/", uploadProject);

export default router;