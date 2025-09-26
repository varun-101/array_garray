import { Router } from "express";
import { 
  createIssue, 
  getIssues, 
  getIssue, 
  updateIssue, 
  closeIssue 
} from "../controllers/issueController.js";

const router = Router();


router.post("/repos/:owner/:repo/issues", createIssue);
router.post("/repos/:owner/:repo/issues/list", getIssues);
router.post("/repos/:owner/:repo/issues/:issue_number", getIssue);
router.patch("/repos/:owner/:repo/issues/:issue_number", updateIssue);
router.patch("/repos/:owner/:repo/issues/:issue_number/close", closeIssue);

export default router;
