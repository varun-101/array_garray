import AIAnalysis from "../models/AIAnalysis.js";
import GitHubService from "./githubService.js";

class AICacheService {
  
  /**
   * Check if we have a cached analysis for the current commit
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} accessToken - GitHub access token (optional)
   * @returns {Object} Cache check result
   */
  async checkCacheStatus(repoUrl, accessToken = null) {
    try {
      const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
      const repositoryFullName = `${owner}/${repo}`;
      
      // Get latest commit from GitHub
      let latestCommit = null;
      if (accessToken) {
        try {
          const githubService = new GitHubService(accessToken);
          latestCommit = await githubService.getLatestCommit(owner, repo);
        } catch (error) {
          console.warn("Could not fetch latest commit from GitHub:", error.message);
        }
      }
      
      // Get latest cached analysis
      const latestAnalysis = await AIAnalysis.findLatestByRepo(repositoryFullName);
      
      if (!latestAnalysis) {
        return {
          needsAnalysis: true,
          reason: "no_previous_analysis",
          latestCommit,
          cachedAnalysis: null,
          cacheStatus: "empty"
        };
      }
      
      // If we couldn't get the latest commit, assume cache is valid
      if (!latestCommit) {
        return {
          needsAnalysis: false,
          reason: "cannot_verify_commits",
          latestCommit: null,
          cachedAnalysis: latestAnalysis,
          cacheStatus: "valid_assumed"
        };
      }
      
      // Check if commits match
      if (latestAnalysis.commitHash === latestCommit.hash) {
        return {
          needsAnalysis: false,
          reason: "up_to_date",
          latestCommit,
          cachedAnalysis: latestAnalysis,
          cacheStatus: "valid"
        };
      }
      
      // New commits available
      return {
        needsAnalysis: true,
        reason: "new_commits",
        latestCommit,
        cachedAnalysis: latestAnalysis,
        cacheStatus: "outdated",
        commitsDifference: {
          cached: latestAnalysis.commitHash,
          latest: latestCommit.hash
        }
      };
      
    } catch (error) {
      console.error("Error checking cache status:", error);
      return {
        needsAnalysis: true,
        reason: "cache_check_failed",
        error: error.message,
        latestCommit: null,
        cachedAnalysis: null,
        cacheStatus: "error"
      };
    }
  }
  
  /**
   * Save analysis to database
   * @param {Object} analysisData - Analysis data to save
   * @returns {Object} Saved analysis document
   */
  async saveAnalysis(analysisData) {
    try {
      const {
        repoUrl,
        projectId,
        projectName,
        techStack,
        difficulty,
        category,
        commitInfo,
        analysis,
        aiModel,
        tokensUsed,
        analysisTime,
        codeMetrics,
        errors = [],
        warnings = []
      } = analysisData;
      
      const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
      const repositoryFullName = `${owner}/${repo}`;
      
      // Get previous analysis for linking
      const previousAnalysis = await AIAnalysis.findLatestByRepo(repositoryFullName);
      
      const aiAnalysisDoc = new AIAnalysis({
        repositoryUrl: repoUrl,
        repositoryFullName,
        projectId,
        projectName,
        commitHash: commitInfo.hash,
        commitMessage: commitInfo.message,
        commitDate: commitInfo.date,
        techStack,
        difficulty,
        category,
        analysis,
        aiModel,
        aiProvider: "OpenRouter",
        tokensUsed,
        analysisTime,
        codeMetrics,
        errors,
        warnings,
        isLatest: true,
        previousAnalysisId: previousAnalysis?._id || null
      });
      
      const savedAnalysis = await aiAnalysisDoc.save();
      
      // Archive old analyses if we have too many
      await AIAnalysis.archiveOldAnalyses(repositoryFullName, 5);
      
      return savedAnalysis;
      
    } catch (error) {
      console.error("Error saving analysis:", error);
      throw new Error(`Failed to save analysis: ${error.message}`);
    }
  }
  
  /**
   * Get analysis with historical context
   * @param {string} repoUrl - GitHub repository URL
   * @param {boolean} includeHistory - Include analysis history
   * @returns {Object} Analysis with context
   */
  async getAnalysisWithContext(repoUrl, includeHistory = false) {
    try {
      const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
      const repositoryFullName = `${owner}/${repo}`;
      
      const latestAnalysis = await AIAnalysis.findLatestByRepo(repositoryFullName);
      
      if (!latestAnalysis) {
        return {
          analysis: null,
          history: [],
          hasHistory: false
        };
      }
      
      let history = [];
      let previousAnalysis = null;
      
      if (includeHistory) {
        history = await AIAnalysis.getAnalysisHistory(repositoryFullName, 10);
      }
      
      // Get previous analysis for comparison
      if (latestAnalysis.previousAnalysisId) {
        previousAnalysis = await AIAnalysis.findById(latestAnalysis.previousAnalysisId);
      }
      
      return {
        analysis: latestAnalysis,
        previousAnalysis,
        history: history.filter(h => h._id.toString() !== latestAnalysis._id.toString()),
        hasHistory: history.length > 1,
        comparison: previousAnalysis ? latestAnalysis.generateComparisonSummary(previousAnalysis) : null,
        scoreImprovement: previousAnalysis ? latestAnalysis.getScoreImprovement(previousAnalysis) : null
      };
      
    } catch (error) {
      console.error("Error getting analysis with context:", error);
      throw new Error(`Failed to get analysis context: ${error.message}`);
    }
  }
  
  /**
   * Generate historical prompt for AI analysis
   * @param {Object} previousAnalysis - Previous analysis data
   * @returns {string} Historical context prompt
   */
  generateHistoricalPrompt(previousAnalysis) {
    if (!previousAnalysis) {
      return "";
    }
    
    const prev = previousAnalysis.analysis;
    
    return `
IMPORTANT: This repository has been analyzed before. Use this historical context to provide better insights:

Previous Analysis (Commit: ${previousAnalysis.commitHash.substring(0, 8)}):
- Overall Score: ${prev.overallScore}/100
- Code Quality: ${prev.codeQuality}/100  
- Maintainability: ${prev.maintainability}/100
- Security: ${prev.security}/100
- Performance: ${prev.performance}/100
- Documentation: ${prev.documentation}/100

Previous Key Recommendations:
${prev.recommendations.slice(0, 3).map(r => `- ${r}`).join('\n')}

Previous Strengths:
${prev.strengths.slice(0, 2).map(s => `- ${s}`).join('\n')}

Previous Areas for Improvement:
${prev.improvements.slice(0, 2).map(i => `- ${i}`).join('\n')}

ANALYSIS INSTRUCTIONS:
1. Compare current code state with previous analysis
2. Identify what has improved or regressed
3. Note if previous recommendations were addressed
4. Provide specific insights about the changes made
5. Adjust scores based on actual improvements/regressions observed
6. Be specific about what changed between commits
`;
  }
  
  /**
   * Clean up old archived analyses
   * @param {number} daysOld - Delete archives older than this many days
   */
  async cleanupOldAnalyses(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await AIAnalysis.deleteMany({
        status: 'archived',
        createdAt: { $lt: cutoffDate }
      });
      
      console.log(`Cleaned up ${result.deletedCount} old archived analyses`);
      return result.deletedCount;
      
    } catch (error) {
      console.error("Error cleaning up old analyses:", error);
      throw new Error(`Failed to cleanup old analyses: ${error.message}`);
    }
  }
  
  /**
   * Get analysis statistics for a repository
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Object} Repository analysis statistics
   */
  async getRepositoryStats(repoUrl) {
    try {
      const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
      const repositoryFullName = `${owner}/${repo}`;
      
      const totalAnalyses = await AIAnalysis.countDocuments({
        repositoryFullName,
        status: { $ne: 'archived' }
      });
      
      const latestAnalysis = await AIAnalysis.findLatestByRepo(repositoryFullName);
      const firstAnalysis = await AIAnalysis.findOne({
        repositoryFullName,
        status: { $ne: 'archived' }
      }).sort({ createdAt: 1 });
      
      let scoreImprovement = null;
      if (latestAnalysis && firstAnalysis && latestAnalysis._id.toString() !== firstAnalysis._id.toString()) {
        scoreImprovement = latestAnalysis.getScoreImprovement(firstAnalysis);
      }
      
      return {
        repositoryFullName,
        totalAnalyses,
        firstAnalysisDate: firstAnalysis?.createdAt || null,
        latestAnalysisDate: latestAnalysis?.createdAt || null,
        latestCommitHash: latestAnalysis?.commitHash || null,
        currentScores: latestAnalysis ? {
          overall: latestAnalysis.analysis.overallScore,
          codeQuality: latestAnalysis.analysis.codeQuality,
          maintainability: latestAnalysis.analysis.maintainability,
          security: latestAnalysis.analysis.security,
          performance: latestAnalysis.analysis.performance,
          documentation: latestAnalysis.analysis.documentation
        } : null,
        scoreImprovement,
        hasHistory: totalAnalyses > 1
      };
      
    } catch (error) {
      console.error("Error getting repository stats:", error);
      throw new Error(`Failed to get repository stats: ${error.message}`);
    }
  }
}

export default AICacheService;
