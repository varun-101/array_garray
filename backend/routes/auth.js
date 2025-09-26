import { Router } from "express";
import { github, githubCallback } from "../controllers/auth.js";

const router = Router();

router.get("/github", github);
router.get("/github/callback", githubCallback);

export default router;  