import { Router } from "express";
import { 
  getUserRepos, 
  getRepo, 
  getRepoBranches, 
  getRepoCommits, 
  checkRepoAccess 
} from "../controllers/repoController.js";

const router = Router();

// Repository routes
router.post("/repos", getUserRepos);
router.post("/repos/:owner/:repo", getRepo);
router.post("/repos/:owner/:repo/branches", getRepoBranches);
router.post("/repos/:owner/:repo/commits", getRepoCommits);
router.post("/repos/:owner/:repo/access", checkRepoAccess);

export default router;
