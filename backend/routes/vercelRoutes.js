import { Router } from "express";
import deployToVercelController from "../controllers/vercelController.js";

const router = Router();

router.post("/deploy", deployToVercelController);


export default router;  