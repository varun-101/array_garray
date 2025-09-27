import { Router } from "express";
import deployToVercelController, { deployImplementationBranch } from "../controllers/vercelController.js";

const router = Router();

router.post("/deploy", deployToVercelController);
router.post("/deploy-implementation", deployImplementationBranch);

export default router;  