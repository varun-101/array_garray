import { Router } from "express";
import { 
  createPullRequest, 
  getPullRequests, 
  getPullRequest, 
  updatePullRequest, 
  mergePullRequest, 
  closePullRequest 
} from "../controllers/prController.js";

const router = Router();

// Pull Request routes
router.post("/repos/:owner/:repo/pulls", createPullRequest);
router.post("/repos/:owner/:repo/pulls/list", getPullRequests);
router.post("/repos/:owner/:repo/pulls/:pr_number", getPullRequest);
router.patch("/repos/:owner/:repo/pulls/:pr_number", updatePullRequest);
router.put("/repos/:owner/:repo/pulls/:pr_number/merge", mergePullRequest);
router.patch("/repos/:owner/:repo/pulls/:pr_number/close", closePullRequest);

export default router;
