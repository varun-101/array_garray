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

  /**
   * Get repository key for caching
   */
  getRepoKey(repoUrl) {
    try {
      // Extract owner/repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        return `${match[1]}_${match[2]}`.replace(/[^a-zA-Z0-9_]/g, '_');
      }
      // Fallback: use base64 encoding of URL
      return Buffer.from(repoUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    } catch (error) {
      console.warn('Error generating repo key:', error);
      return 'unknown_repo';
    }
  }

  /**
   * Store implementation record for tracking
   */
  async storeImplementationRecord(implementationData) {
    try {
      const { repoUrl, projectName, implementation, result, pullRequest, timestamp } = implementationData;
      
      // Check if Redis is available
      if (!this.redis) {
        console.warn('Redis not available, skipping implementation record storage');
        return null;
      }
      
      const cacheKey = `implementation:${this.getRepoKey(repoUrl)}:${implementation.id}:${Date.now()}`;
      
      const record = {
        repoUrl,
        projectName,
        implementation: {
          id: implementation.id,
          title: implementation.title,
          description: implementation.description,
          category: implementation.category,
          priority: implementation.priority,
          difficulty: implementation.difficulty
        },
        result: {
          success: result.success,
          branchName: result.branchName,
          modifiedFiles: result.modifiedFiles,
          commitHash: result.commitHash,
          validationResults: result.validationResults
        },
        pullRequest: pullRequest ? {
          success: pullRequest.success,
          url: pullRequest.url,
          branchName: pullRequest.branchName,
          error: pullRequest.error
        } : null,
        metadata: {
          timestamp,
          storageDate: new Date().toISOString(),
          version: '1.0'
        }
      };

      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(record));
      
      // Also store in a list for easy retrieval
      const listKey = `implementations:${this.getRepoKey(repoUrl)}`;
      await this.redis.lpush(listKey, cacheKey);
      await this.redis.expire(listKey, this.CACHE_TTL);
      
      console.log(`Implementation record stored: ${implementation.title}`);
      return cacheKey;
      
    } catch (error) {
      console.error("Error storing implementation record:", error);
      throw new Error(`Failed to store implementation record: ${error.message}`);
    }
  }

  /**
   * Store batch implementation record
   */
  async storeBatchImplementationRecord(batchData) {
    try {
      // Check if Redis is available
      if (!this.redis) {
        console.warn('Redis not available, skipping batch implementation record storage');
        return null;
      }
      
      const { repoUrl, projectName, implementations, results, successCount, failureCount, timestamp } = batchData;
      const cacheKey = `batch:${this.getRepoKey(repoUrl)}:${Date.now()}`;
      
      const record = {
        repoUrl,
        projectName,
        batch: {
          implementations: implementations.map(impl => ({
            id: impl.id,
            title: impl.title,
            category: impl.category,
            priority: impl.priority
          })),
          results: results.map(result => ({
            implementation: result.implementation,
            success: result.success,
            branchName: result.branchName,
            error: result.error
          })),
          summary: {
            total: implementations.length,
            successful: successCount,
            failed: failureCount,
            successRate: Math.round((successCount / implementations.length) * 100)
          }
        },
        metadata: {
          timestamp,
          storageDate: new Date().toISOString(),
          version: '1.0'
        }
      };

      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(record));
      
      // Store in batch list
      const listKey = `batches:${this.getRepoKey(repoUrl)}`;
      await this.redis.lpush(listKey, cacheKey);
      await this.redis.expire(listKey, this.CACHE_TTL);
      
      console.log(`Batch implementation record stored: ${implementations.length} items`);
      return cacheKey;
      
    } catch (error) {
      console.error("Error storing batch implementation record:", error);
      throw new Error(`Failed to store batch implementation record: ${error.message}`);
    }
  }

  /**
   * Get implementation history for a repository
   */
  async getImplementationHistory(repoUrl, implementationId = null) {
    try {
      const listKey = `implementations:${this.getRepoKey(repoUrl)}`;
      const implementationKeys = await this.redis.lrange(listKey, 0, -1);
      
      if (implementationKeys.length === 0) {
        return [];
      }

      const implementations = [];
      for (const key of implementationKeys) {
        try {
          const data = await this.redis.get(key);
          if (data) {
            const record = JSON.parse(data);
            
            // Filter by implementation ID if specified
            if (implementationId && record.implementation.id !== implementationId) {
              continue;
            }
            
            implementations.push({
              id: record.implementation.id,
              title: record.implementation.title,
              category: record.implementation.category,
              priority: record.implementation.priority,
              success: record.result.success,
              branchName: record.result.branchName,
              modifiedFiles: record.result.modifiedFiles,
              pullRequest: record.pullRequest,
              timestamp: record.metadata.timestamp,
              cacheKey: key
            });
          }
        } catch (parseError) {
          console.warn(`Failed to parse implementation record ${key}:`, parseError);
        }
      }

      // Sort by timestamp (newest first)
      implementations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return implementations;
      
    } catch (error) {
      console.error("Error getting implementation history:", error);
      throw new Error(`Failed to get implementation history: ${error.message}`);
    }
  }

  /**
   * Get batch implementation history
   */
  async getBatchHistory(repoUrl) {
    try {
      const listKey = `batches:${this.getRepoKey(repoUrl)}`;
      const batchKeys = await this.redis.lrange(listKey, 0, -1);
      
      if (batchKeys.length === 0) {
        return [];
      }

      const batches = [];
      for (const key of batchKeys) {
        try {
          const data = await this.redis.get(key);
          if (data) {
            const record = JSON.parse(data);
            batches.push({
              summary: record.batch.summary,
              implementations: record.batch.implementations,
              timestamp: record.metadata.timestamp,
              cacheKey: key
            });
          }
        } catch (parseError) {
          console.warn(`Failed to parse batch record ${key}:`, parseError);
        }
      }

      // Sort by timestamp (newest first)
      batches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return batches;
      
    } catch (error) {
      console.error("Error getting batch history:", error);
      throw new Error(`Failed to get batch history: ${error.message}`);
    }
  }

  /**
   * Get implementation statistics for a repository
   */
  async getImplementationStats(repoUrl) {
    try {
      const implementations = await this.getImplementationHistory(repoUrl);
      const batches = await this.getBatchHistory(repoUrl);
      
      const totalImplementations = implementations.length;
      const successfulImplementations = implementations.filter(impl => impl.success).length;
      const failedImplementations = totalImplementations - successfulImplementations;
      
      const successRate = totalImplementations > 0 ? 
        Math.round((successfulImplementations / totalImplementations) * 100) : 0;
      
      const categoryStats = implementations.reduce((stats, impl) => {
        stats[impl.category] = (stats[impl.category] || 0) + 1;
        return stats;
      }, {});
      
      const priorityStats = implementations.reduce((stats, impl) => {
        stats[impl.priority] = (stats[impl.priority] || 0) + 1;
        return stats;
      }, {});

      return {
        totalImplementations,
        successfulImplementations,
        failedImplementations,
        successRate,
        totalBatches: batches.length,
        categoryBreakdown: categoryStats,
        priorityBreakdown: priorityStats,
        recentActivity: implementations.slice(0, 5), // Last 5 implementations
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("Error getting implementation stats:", error);
      throw new Error(`Failed to get implementation stats: ${error.message}`);
    }
  }
}

export default AICacheService;
