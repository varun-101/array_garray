import express from 'express';
import { 
  generateImplementation, 
  batchImplementation, 
  getImplementationStatus,
  getImplementationHistory,
  getImplementationStatistics,
  getBatchImplementation,
  generateImplementationPlan,
  getDeploymentInfo,
  getRepositoryDeployments
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
 * @route GET /api/implementation/history
 * @desc Get implementation history with pagination and filtering
 * @query projectName - Project name (optional)
 * @query repoUrl - Repository URL (optional)
 * @query status - Implementation status filter (optional)
 * @query limit - Number of results per page (default: 20)
 * @query offset - Number of results to skip (default: 0)
 * @access Public
 */
router.get('/history', getImplementationHistory);

/**
 * @route GET /api/implementation/statistics
 * @desc Get implementation statistics and analytics
 * @query projectName - Project name (optional)
 * @query repoUrl - Repository URL (optional)
 * @query userId - User ID (optional)
 * @query timeRange - Time range filter: '7d', '30d', '90d' (default: '30d')
 * @access Public
 */
router.get('/statistics', getImplementationStatistics);

/**
 * @route GET /api/implementation/batch/:batchId
 * @desc Get batch implementation details
 * @param batchId - Batch ID (required)
 * @access Public
 */
router.get('/batch/:batchId', getBatchImplementation);

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

/**
 * @route GET /api/implementation/deployment/:implementationId
 * @desc Get deployment information for a specific implementation
 * @param implementationId - Implementation ID (required)
 * @access Public
 */
router.get('/deployment/:implementationId', getDeploymentInfo);

/**
 * @route GET /api/implementation/deployments
 * @desc Get all deployments for a repository
 * @query repoUrl - Repository URL (required)
 * @query limit - Number of deployments to return (optional, default: 10)
 * @access Public
 */
router.get('/deployments', getRepositoryDeployments);

export default router;
