import express from 'express';
import { 
  generateImplementation, 
  batchImplementation, 
  getImplementationStatus, 
  generateImplementationPlan 
} from '../controllers/codeImplementationController.js';

const router = express.Router();

/**
 * @route POST /api/implementation/generate
 * @desc Generate code implementation for a single recommendation using Gemini CLI
 * @body {
 *   repoUrl: string (required) - GitHub repository URL
 *   projectName: string (required) - Name of the project
 *   techStack: string[] (optional) - Array of technologies used
 *   difficulty: string (optional) - 'beginner' | 'intermediate' | 'advanced'
 *   category: string (optional) - Project category
 *   implementation: object (required) - Implementation details
 *   analysisData: object (optional) - AI analysis data for context
 * }
 * @access Public
 */
router.post('/generate', generateImplementation);

/**
 * @route POST /api/implementation/batch
 * @desc Generate code implementations for multiple recommendations in batch
 * @body {
 *   repoUrl: string (required) - GitHub repository URL
 *   projectName: string (required) - Name of the project
 *   techStack: string[] (optional) - Array of technologies used
 *   difficulty: string (optional) - 'beginner' | 'intermediate' | 'advanced'
 *   category: string (optional) - Project category
 *   implementations: array (required) - Array of implementation details
 *   analysisData: object (optional) - AI analysis data for context
 *   createSeparatePRs: boolean (optional) - Whether to create separate PRs for each implementation
 * }
 * @access Public
 */
router.post('/batch', batchImplementation);

/**
 * @route GET /api/implementation/status
 * @desc Get implementation status and history for a repository
 * @query repoUrl - Repository URL (required)
 * @query implementationId - Specific implementation ID (optional)
 * @access Public
 */
router.get('/status', getImplementationStatus);

/**
 * @route POST /api/implementation/plan
 * @desc Generate implementation plan without executing (dry-run)
 * @body {
 *   repoUrl: string (required) - GitHub repository URL
 *   projectName: string (required) - Name of the project
 *   techStack: string[] (optional) - Array of technologies used
 *   implementations: array (required) - Array of implementation details
 *   analysisData: object (optional) - AI analysis data for context
 * }
 * @access Public
 */
router.post('/plan', generateImplementationPlan);

export default router;
