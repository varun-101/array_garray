import GeminiCodeService from '../services/geminiCodeService.js';
import AICacheService from '../services/aiCacheService.js';

/**
 * Generate code implementation for a single recommendation
 */
export const generateImplementation = async (req, res) => {
  try {
    const {
      repoUrl,
      projectName,
      techStack = [],
      difficulty = 'intermediate',
      category = 'Web Development',
      implementation,
      analysisData = null
    } = req.body;

    // Validate required fields
    if (!repoUrl || !projectName || !implementation) {
      return res.status(400).json({
        error: "Repository URL, project name, and implementation details are required",
        details: "Please provide repoUrl, projectName, and implementation in the request body"
      });
    }

    // Validate implementation object
    if (!implementation.id || !implementation.title || !implementation.description) {
      return res.status(400).json({
        error: "Invalid implementation object",
        details: "Implementation must have id, title, and description"
      });
    }

    console.log(`Starting code implementation for: ${implementation.title}`);
    console.log(`Repository: ${repoUrl}`);
    console.log(`Project: ${projectName}`);

    const geminiService = new GeminiCodeService();
    
    // Initialize workspace
    const projectDir = await geminiService.initializeWorkspace(repoUrl, projectName);
    
    // Setup Gemini configuration
    const projectContext = {
      projectName,
      techStack,
      difficulty,
      category,
      analysisData
    };
    await geminiService.setupGeminiConfig(projectDir, projectContext);

    // Generate implementation
    const result = await geminiService.generateImplementation(projectDir, implementation);

    // Create pull request if implementation was successful
    let pullRequestResult = null;
    if (result.success) {
      try {
        pullRequestResult = await geminiService.createPullRequest(
          projectDir, 
          result.branchName, 
          implementation
        );
      } catch (prError) {
        console.warn('Pull request creation failed:', prError.message);
        pullRequestResult = { 
          success: false, 
          error: prError.message,
          branchName: result.branchName 
        };
      }
    }

    // Store implementation record in cache for tracking
    try {
      const cacheService = new AICacheService();
      const cacheResult = await cacheService.storeImplementationRecord({
        repoUrl,
        projectName,
        implementation,
        result,
        pullRequest: pullRequestResult,
        timestamp: new Date().toISOString()
      });
      
      if (cacheResult) {
        console.log('Implementation record cached successfully');
      }
    } catch (cacheError) {
      console.warn('Failed to store implementation record:', cacheError.message);
      // Don't fail the entire operation just because caching failed
    }

    return res.json({
      success: true,
      implementation: {
        id: implementation.id,
        title: implementation.title,
        status: result.success ? 'completed' : 'failed'
      },
      codeGeneration: result,
      pullRequest: pullRequestResult,
      metadata: {
        projectName,
        branchName: result.branchName,
        modifiedFiles: result.modifiedFiles,
        commitHash: result.commitHash,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Code implementation failed:', error);
    return res.status(500).json({
      error: "Code implementation failed",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate code implementations for multiple recommendations (batch processing)
 */
export const batchImplementation = async (req, res) => {
  try {
    const {
      repoUrl,
      projectName,
      techStack = [],
      difficulty = 'intermediate',
      category = 'Web Development',
      implementations = [],
      analysisData = null,
      createSeparatePRs = true
    } = req.body;

    // Validate required fields
    if (!repoUrl || !projectName || !implementations.length) {
      return res.status(400).json({
        error: "Repository URL, project name, and implementations are required",
        details: "Please provide repoUrl, projectName, and implementations array"
      });
    }

    // Validate implementations array
    for (const impl of implementations) {
      if (!impl.id || !impl.title || !impl.description) {
        return res.status(400).json({
          error: "Invalid implementation in array",
          details: "Each implementation must have id, title, and description"
        });
      }
    }

    console.log(`Starting batch implementation for ${implementations.length} items`);
    console.log(`Repository: ${repoUrl}`);
    console.log(`Project: ${projectName}`);

    const geminiService = new GeminiCodeService();
    
    // Initialize workspace
    const projectDir = await geminiService.initializeWorkspace(repoUrl, projectName);
    
    // Setup Gemini configuration
    const projectContext = {
      projectName,
      techStack,
      difficulty,
      category,
      analysisData
    };
    await geminiService.setupGeminiConfig(projectDir, projectContext);

    // Process implementations
    const results = await geminiService.batchImplementation(projectDir, implementations);

    // Calculate success metrics
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // Store batch implementation record
    try {
      const cacheService = new AICacheService();
      await cacheService.storeBatchImplementationRecord({
        repoUrl,
        projectName,
        implementations,
        results,
        successCount,
        failureCount,
        timestamp: new Date().toISOString()
      });
    } catch (cacheError) {
      console.warn('Failed to store batch implementation record:', cacheError.message);
    }

    return res.json({
      success: true,
      summary: {
        total: implementations.length,
        successful: successCount,
        failed: failureCount,
        successRate: Math.round((successCount / implementations.length) * 100)
      },
      results: results.map(result => ({
        implementation: result.implementation,
        success: result.success,
        branchName: result.branchName,
        modifiedFiles: result.modifiedFiles,
        pullRequest: result.pullRequest,
        error: result.error
      })),
      metadata: {
        projectName,
        processedAt: new Date().toISOString(),
        workspace: projectDir
      }
    });

  } catch (error) {
    console.error('Batch implementation failed:', error);
    return res.status(500).json({
      error: "Batch implementation failed",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get implementation status and history
 */
export const getImplementationStatus = async (req, res) => {
  try {
    const { repoUrl, implementationId } = req.query;

    if (!repoUrl) {
      return res.status(400).json({
        error: "Repository URL is required",
        details: "Please provide repoUrl in query parameters"
      });
    }

    const cacheService = new AICacheService();
    
    // Get implementation history
    const history = await cacheService.getImplementationHistory(repoUrl, implementationId);
    
    return res.json({
      success: true,
      history,
      metadata: {
        repoUrl,
        implementationId,
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to get implementation status:', error);
    return res.status(500).json({
      error: "Failed to retrieve implementation status",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate implementation plan (dry-run without actual code generation)
 */
export const generateImplementationPlan = async (req, res) => {
  try {
    const {
      repoUrl,
      projectName,
      techStack = [],
      implementations = [],
      analysisData = null
    } = req.body;

    if (!repoUrl || !projectName || !implementations.length) {
      return res.status(400).json({
        error: "Repository URL, project name, and implementations are required"
      });
    }

    console.log(`Generating implementation plan for ${implementations.length} items`);

    // Generate detailed plan for each implementation
    const plan = implementations.map((impl, index) => {
      const estimatedTime = this.estimateImplementationTime(impl, techStack);
      const dependencies = this.identifyDependencies(impl, implementations);
      const riskLevel = this.assessRiskLevel(impl, analysisData);

      return {
        order: index + 1,
        implementation: {
          id: impl.id,
          title: impl.title,
          description: impl.description,
          category: impl.category,
          priority: impl.priority,
          difficulty: impl.difficulty
        },
        estimation: {
          timeRequired: estimatedTime,
          complexity: impl.difficulty,
          riskLevel,
          confidence: this.calculateConfidence(impl, techStack)
        },
        strategy: {
          approach: this.determineApproach(impl, techStack),
          filesExpectedToChange: this.estimateFilesToChange(impl, techStack),
          testingStrategy: this.planTestingStrategy(impl),
          rollbackPlan: this.createRollbackPlan(impl)
        },
        dependencies: dependencies,
        prerequisites: this.identifyPrerequisites(impl, techStack)
      };
    });

    // Calculate overall plan metrics
    const totalEstimatedTime = plan.reduce((sum, item) => sum + item.estimation.timeRequired, 0);
    const averageRiskLevel = plan.reduce((sum, item) => sum + item.estimation.riskLevel, 0) / plan.length;

    return res.json({
      success: true,
      plan: {
        implementations: plan,
        summary: {
          totalItems: implementations.length,
          estimatedTotalTime: `${totalEstimatedTime} minutes`,
          averageRiskLevel: Math.round(averageRiskLevel * 10) / 10,
          recommendedBatchSize: this.recommendBatchSize(plan),
          suggestedOrder: this.optimizeImplementationOrder(plan)
        },
        recommendations: this.generatePlanRecommendations(plan, analysisData)
      },
      metadata: {
        projectName,
        repoUrl,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to generate implementation plan:', error);
    return res.status(500).json({
      error: "Failed to generate implementation plan",
      details: error.message
    });
  }
};

// Helper methods for plan generation
function estimateImplementationTime(implementation, techStack) {
  const baseTime = {
    'Beginner': 30,
    'Intermediate': 60,
    'Advanced': 120
  };
  
  const categoryMultiplier = {
    'Security': 1.5,
    'Performance': 1.3,
    'Testing': 1.2,
    'Quality': 1.0,
    'Documentation': 0.8
  };

  const base = baseTime[implementation.difficulty] || 60;
  const multiplier = categoryMultiplier[implementation.category] || 1.0;
  
  return Math.round(base * multiplier);
}

function identifyDependencies(implementation, allImplementations) {
  // Simple dependency detection based on categories and priorities
  return allImplementations
    .filter(other => other.id !== implementation.id)
    .filter(other => {
      // Security fixes should come before other implementations
      if (implementation.category !== 'Security' && other.category === 'Security') {
        return true;
      }
      // High priority items should be dependencies for lower priority
      if (implementation.priority === 'Low' && other.priority === 'High') {
        return true;
      }
      return false;
    })
    .map(dep => ({ id: dep.id, title: dep.title, reason: 'Priority/Category dependency' }));
}

function assessRiskLevel(implementation, analysisData) {
  let risk = 1; // Base risk
  
  if (implementation.difficulty === 'Advanced') risk += 2;
  if (implementation.category === 'Security') risk += 1;
  if (implementation.priority === 'High') risk += 0.5;
  
  return Math.min(risk, 5); // Cap at 5
}

function calculateConfidence(implementation, techStack) {
  // Higher confidence for common tech stacks and simpler implementations
  const commonTech = ['React', 'Node.js', 'JavaScript', 'TypeScript'];
  const hasCommonTech = techStack.some(tech => commonTech.includes(tech));
  
  let confidence = hasCommonTech ? 0.8 : 0.6;
  if (implementation.difficulty === 'Beginner') confidence += 0.1;
  if (implementation.difficulty === 'Advanced') confidence -= 0.1;
  
  return Math.round(confidence * 100);
}

function determineApproach(implementation, techStack) {
  const approaches = {
    'Security': 'Add validation and security checks',
    'Performance': 'Optimize code and add caching',
    'Testing': 'Add test cases and test utilities',
    'Quality': 'Refactor and improve code structure',
    'Documentation': 'Add comments and documentation'
  };
  
  return approaches[implementation.category] || 'Implement feature according to requirements';
}

function estimateFilesToChange(implementation, techStack) {
  const estimates = {
    'Security': ['middleware', 'validation', 'auth'],
    'Performance': ['services', 'components', 'utils'],
    'Testing': ['tests', 'spec files', 'test utilities'],
    'Quality': ['core modules', 'services', 'components'],
    'Documentation': ['README', 'comments', 'docs']
  };
  
  return estimates[implementation.category] || ['main application files'];
}

function planTestingStrategy(implementation) {
  const strategies = {
    'Security': 'Security testing and penetration testing',
    'Performance': 'Load testing and performance benchmarks',
    'Testing': 'Test the tests and coverage analysis',
    'Quality': 'Code review and static analysis',
    'Documentation': 'Documentation review and validation'
  };
  
  return strategies[implementation.category] || 'Unit and integration testing';
}

function createRollbackPlan(implementation) {
  return `Create backup branch, implement feature flags, and prepare revert commits for ${implementation.title}`;
}

function identifyPrerequisites(implementation, techStack) {
  const prerequisites = [];
  
  if (implementation.category === 'Testing') {
    prerequisites.push('Testing framework must be installed');
  }
  if (implementation.category === 'Security') {
    prerequisites.push('Security dependencies must be available');
  }
  
  return prerequisites;
}

function recommendBatchSize(plan) {
  const highRiskCount = plan.filter(p => p.estimation.riskLevel >= 3).length;
  if (highRiskCount > 3) return 2;
  if (plan.length > 10) return 5;
  return 3;
}

function optimizeImplementationOrder(plan) {
  // Sort by priority (Security first), then by risk level (low risk first)
  return plan
    .sort((a, b) => {
      if (a.implementation.category === 'Security' && b.implementation.category !== 'Security') return -1;
      if (b.implementation.category === 'Security' && a.implementation.category !== 'Security') return 1;
      return a.estimation.riskLevel - b.estimation.riskLevel;
    })
    .map((item, index) => ({ order: index + 1, id: item.implementation.id, title: item.implementation.title }));
}

function generatePlanRecommendations(plan, analysisData) {
  const recommendations = [];
  
  const highRiskItems = plan.filter(p => p.estimation.riskLevel >= 4);
  if (highRiskItems.length > 0) {
    recommendations.push('Consider manual review for high-risk implementations');
  }
  
  const securityItems = plan.filter(p => p.implementation.category === 'Security');
  if (securityItems.length > 0) {
    recommendations.push('Prioritize security implementations and test thoroughly');
  }
  
  if (plan.length > 5) {
    recommendations.push('Consider splitting into multiple batches for better control');
  }
  
  return recommendations;
}

export default {
  generateImplementation,
  batchImplementation,
  getImplementationStatus,
  generateImplementationPlan
};
