import AIAnalysisService from "../services/aiAnalysisService.js";
import AICacheService from "../services/aiCacheService.js";

/**
 * Generate AI analysis for a project
 */
export const analyzeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      repoUrl, 
      projectName, 
      techStack = [], 
      difficulty = 'intermediate', 
      category = 'Web Development',
      accessToken = null,
      forceRegenerate = false
    } = req.body;

    // Validate required fields
    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "Repository URL and project name are required",
        details: "Please provide both repoUrl and projectName in the request body"
      });
    }

    // Validate repository URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?$/;
    if (!githubUrlPattern.test(repoUrl.replace(/\.git$/, ''))) {
      return res.status(400).json({
        error: "Invalid GitHub repository URL",
        details: "Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
      });
    }

    console.log(`Starting AI analysis for project: ${projectName}`);
    console.log(`Repository: ${repoUrl}`);
    console.log(`Tech Stack: ${techStack.join(', ')}`);
    console.log(`Force regenerate: ${forceRegenerate}`);

    const aiService = new AIAnalysisService();
    
    // If force regenerate is requested, bypass cache
    let analysisResult;
    if (forceRegenerate) {
      console.log("Force regenerating analysis...");
      analysisResult = await aiService.analyzeRepository(repoUrl, projectName, techStack, difficulty, category);
      analysisResult = {
        analysis: analysisResult.analysis,
        cached: false,
        cacheStatus: "force_regenerated",
        fromCache: false
      };
    } else {
      // Use cached analysis system
      analysisResult = await aiService.analyzeRepositoryWithCache(
        repoUrl, 
        projectName, 
        techStack, 
        difficulty, 
        category,
        projectId,
        accessToken
      );
    }

    console.log(`AI analysis completed for project: ${projectName} (cached: ${analysisResult.cached})`);

    // Return the analysis with cache metadata
    res.json({
      success: true,
      projectId: projectId || null,
      projectName,
      repoUrl,
      techStack,
      difficulty,
      category,
      analysis: analysisResult.analysis,
      cached: analysisResult.cached,
      cacheStatus: analysisResult.cacheStatus,
      commitHash: analysisResult.commitHash,
      analysisDate: analysisResult.analysisDate,
      comparison: analysisResult.comparison || null,
      generatedAt: new Date().toISOString(),
      version: "1.0"
    });

  } catch (error) {
    console.error("Error in AI analysis:", error);
    
    // Determine error type and respond accordingly
    let statusCode = 500;
    let errorMessage = "AI analysis failed";
    
    if (error.message.includes("OpenRouter API key")) {
      statusCode = 503;
      errorMessage = "AI service not available - configuration error";
    } else if (error.message.includes("Insufficient AI service credits")) {
      statusCode = 402;
      errorMessage = "Insufficient AI service credits";
    } else if (error.message.includes("clone repository")) {
      statusCode = 400;
      errorMessage = "Unable to access repository";
    } else if (error.message.includes("rate limit")) {
      statusCode = 429;
      errorMessage = "AI service rate limit exceeded";
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
      projectName: req.body.projectName || "Unknown",
      repoUrl: req.body.repoUrl || "Unknown"
    });
  }
};

/**
 * Get AI analysis for a project by repository URL or project ID
 */
export const getProjectAnalysis = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { repoUrl, includeHistory = false } = req.query;
    
    if (!projectId && !repoUrl) {
      return res.status(400).json({
        error: "Project ID or repository URL is required",
        details: "Provide either projectId in the URL or repoUrl in query parameters"
      });
    }
    
    const cacheService = new AICacheService();
    
    let analysisContext;
    if (repoUrl) {
      // Get analysis by repository URL
      analysisContext = await cacheService.getAnalysisWithContext(repoUrl, includeHistory === 'true');
    } else {
      // Get analysis by project ID (would need to implement this)
      return res.status(501).json({
        error: "Analysis retrieval by project ID not implemented yet",
        note: "Use repoUrl query parameter instead"
      });
    }
    
    if (!analysisContext.analysis) {
      return res.status(404).json({
        error: "No analysis found",
        details: "No cached analysis found for this repository"
      });
    }
    
    // Get repository stats
    const repoStats = await cacheService.getRepositoryStats(repoUrl);
    
    res.json({
      success: true,
      analysis: analysisContext.analysis.analysis,
      metadata: {
        commitHash: analysisContext.analysis.commitHash,
        commitMessage: analysisContext.analysis.commitMessage,
        analysisDate: analysisContext.analysis.createdAt,
        aiModel: analysisContext.analysis.aiModel,
        tokensUsed: analysisContext.analysis.tokensUsed,
        analysisTime: analysisContext.analysis.analysisTime,
        cached: true,
        fromDatabase: true
      },
      comparison: analysisContext.comparison,
      scoreImprovement: analysisContext.scoreImprovement,
      history: includeHistory === 'true' ? analysisContext.history.map(h => ({
        commitHash: h.commitHash,
        commitMessage: h.commitMessage,
        analysisDate: h.createdAt,
        overallScore: h.analysis.overallScore,
        codeQuality: h.analysis.codeQuality,
        maintainability: h.analysis.maintainability,
        security: h.analysis.security,
        performance: h.analysis.performance,
        documentation: h.analysis.documentation
      })) : [],
      repositoryStats: repoStats
    });

  } catch (error) {
    console.error("Error retrieving analysis:", error);
    res.status(500).json({
      error: "Failed to retrieve analysis",
      details: error.message
    });
  }
};

/**
 * Get AI service status
 */
export const getAIServiceStatus = async (req, res) => {
  try {
    const aiService = new AIAnalysisService();
    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    const currentModel = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
    
    res.json({
      status: hasApiKey ? "available" : "unavailable",
      hasApiKey,
      provider: "OpenRouter",
      model: currentModel,
      message: hasApiKey 
        ? "AI analysis service is ready with OpenRouter" 
        : "OpenRouter API key not configured",
      version: "1.0",
      supportedFeatures: [
        "Repository code analysis",
        "Code quality assessment", 
        "Security analysis",
        "Performance evaluation",
        "Architecture review",
        "Tech stack analysis"
      ],
      availableModels: [
        "anthropic/claude-3.5-sonnet",
        "openai/gpt-4-turbo",
        "openai/gpt-3.5-turbo",
        "meta-llama/llama-3.1-70b-instruct",
        "google/gemini-pro"
      ]
    });

  } catch (error) {
    console.error("Error checking AI service status:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to check service status",
      details: error.message
    });
  }
};

/**
 * Get analysis history for a repository
 */
export const getAnalysisHistory = async (req, res) => {
  try {
    const { repoUrl, limit = 10 } = req.query;
    
    if (!repoUrl) {
      return res.status(400).json({
        error: "Repository URL is required",
        details: "Provide repoUrl in query parameters"
      });
    }
    
    const cacheService = new AICacheService();
    const GitHubService = (await import("../services/githubService.js")).default;
    const AIAnalysis = (await import("../models/AIAnalysis.js")).default;
    
    const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
    const repositoryFullName = `${owner}/${repo}`;
    
    const history = await AIAnalysis.getAnalysisHistory(repositoryFullName, parseInt(limit));
    const repoStats = await cacheService.getRepositoryStats(repoUrl);
    
    res.json({
      success: true,
      repositoryFullName,
      history: history.map(h => ({
        id: h._id,
        commitHash: h.commitHash,
        commitMessage: h.commitMessage,
        analysisDate: h.createdAt,
        isLatest: h.isLatest,
        scores: {
          overall: h.analysis.overallScore,
          codeQuality: h.analysis.codeQuality,
          maintainability: h.analysis.maintainability,
          security: h.analysis.security,
          performance: h.analysis.performance,
          documentation: h.analysis.documentation
        },
        aiModel: h.aiModel,
        tokensUsed: h.tokensUsed,
        analysisTime: h.analysisTime
      })),
      repositoryStats: repoStats,
      totalCount: history.length
    });

  } catch (error) {
    console.error("Error retrieving analysis history:", error);
    res.status(500).json({
      error: "Failed to retrieve analysis history",
      details: error.message
    });
  }
};
import aiService from "../services/aiService.js";
const aiResponseController = async(req, res) => {
    try{
        const {metaData} = req.body;
        const response = await aiService(metaData);
        res.status(200).json({ message:response});

    } catch(err){
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    }
}


export default aiResponseController;