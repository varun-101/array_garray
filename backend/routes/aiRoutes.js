import { Router } from "express";
import aiResponseController from "../controllers/aiController.js";

const router = Router();

router.get("/generate", aiResponseController);


export default router;  