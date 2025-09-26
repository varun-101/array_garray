import express from 'express';
import { analyzeProject, getProjectAnalysis, getAIServiceStatus, getAnalysisHistory } from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route POST /api/ai/analyze/:projectId?
 * @desc Generate AI analysis for a project repository
 * @body {
 *   repoUrl: string (required) - GitHub repository URL
 *   projectName: string (required) - Name of the project  
 *   techStack: string[] (optional) - Array of technologies used
 *   difficulty: string (optional) - 'beginner' | 'intermediate' | 'advanced'
 *   category: string (optional) - Project category
 * }
 * @access Public
 */
router.post('/analyze/:projectId?', analyzeProject);

/**
 * @route GET /api/ai/analysis/:projectId
 * @desc Get cached AI analysis for a project (future feature)
 * @access Public
 */
router.get('/analysis/:projectId', getProjectAnalysis);

/**
 * @route GET /api/ai/status
 * @desc Get AI service status and capabilities
 * @access Public
 */
router.get('/status', getAIServiceStatus);

/**
 * @route GET /api/ai/history
 * @desc Get analysis history for a repository
 * @query repoUrl - Repository URL (required)
 * @query limit - Number of analyses to return (default: 10)
 * @access Public
 */
router.get('/history', getAnalysisHistory);

// export default router;
// import { Router } from "express";
import aiResponseController from "../controllers/aiController.js";

// const router = Router();

router.post("/generate", aiResponseController);

export default router;  