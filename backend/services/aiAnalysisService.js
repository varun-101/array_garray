import axios from "axios";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import AICacheService from "./aiCacheService.js";
import GitHubService from "./githubService.js";

const execAsync = promisify(exec);

class AIAnalysisService {
  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openRouterBaseUrl = "https://openrouter.ai/api/v1";
    this.appName = process.env.OPENROUTER_APP_NAME || "Codeissance-Hackathon-App";
    this.defaultModel = process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo";
    this.tempDir = "/tmp/repo_analysis";
    this.cacheService = new AICacheService();
  }

  /**
   * Analyze repository with caching support
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} projectName - Name of the project
   * @param {Array} techStack - Technologies used in the project
   * @param {string} difficulty - Project difficulty level
   * @param {string} category - Project category
   * @param {string} projectId - Optional project ID
   * @param {string} accessToken - Optional GitHub access token
   * @returns {Object} AI analysis results with cache info
   */
  async analyzeRepositoryWithCache(repoUrl, projectName, techStack, difficulty, category, projectId = null, accessToken = null) {
    const startTime = Date.now();
    
    try {
      // Check cache status first
      const cacheStatus = await this.cacheService.checkCacheStatus(repoUrl, accessToken);
      
      if (!cacheStatus.needsAnalysis) {
        console.log(`Using cached analysis for ${repoUrl}`);
        return {
          analysis: cacheStatus.cachedAnalysis.analysis,
          cached: true,
          cacheStatus: cacheStatus.cacheStatus,
          commitHash: cacheStatus.cachedAnalysis.commitHash,
          analysisDate: cacheStatus.cachedAnalysis.createdAt,
          fromCache: true
        };
      }
      
      console.log(`Generating new analysis for ${repoUrl}. Reason: ${cacheStatus.reason}`);
      
      // Generate new analysis
      const analysisResult = await this.analyzeRepository(repoUrl, projectName, techStack, difficulty, category, cacheStatus);
      
      // Get commit info for saving
      let commitInfo = cacheStatus.latestCommit;
      if (!commitInfo && accessToken) {
        try {
          const { owner, repo } = GitHubService.parseRepoUrl(repoUrl);
          const githubService = new GitHubService(accessToken);
          commitInfo = await githubService.getLatestCommit(owner, repo);
        } catch (error) {
          console.warn("Could not get commit info:", error.message);
          // Use dummy commit info
          commitInfo = {
            hash: Date.now().toString(),
            message: "Analysis without commit tracking",
            date: new Date()
          };
        }
      }
      
      // Save to cache
      const savedAnalysis = await this.cacheService.saveAnalysis({
        repoUrl,
        projectId,
        projectName,
        techStack,
        difficulty,
        category,
        commitInfo: commitInfo || {
          hash: Date.now().toString(),
          message: "Analysis without commit tracking",
          date: new Date()
        },
        analysis: analysisResult.analysis,
        aiModel: this.defaultModel,
        tokensUsed: analysisResult.tokensUsed,
        analysisTime: Date.now() - startTime,
        codeMetrics: analysisResult.codeMetrics,
        errors: analysisResult.errors || [],
        warnings: analysisResult.warnings || []
      });
      
      return {
        analysis: analysisResult.analysis,
        cached: false,
        cacheStatus: "generated",
        commitHash: commitInfo?.hash,
        analysisDate: savedAnalysis.createdAt,
        fromCache: false,
        previousAnalysis: cacheStatus.cachedAnalysis,
        comparison: cacheStatus.cachedAnalysis ? 
          savedAnalysis.generateComparisonSummary(cacheStatus.cachedAnalysis) : null
      };
      
    } catch (error) {
      console.error("Error in cached analysis:", error);
      throw error;
    }
  }

  /**
   * Download repository content and perform AI analysis (original method)
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} projectName - Name of the project
   * @param {Array} techStack - Technologies used in the project
   * @param {string} difficulty - Project difficulty level
   * @param {string} category - Project category
   * @param {Object} cacheStatus - Cache status information
   * @returns {Object} AI analysis results
   */
  async analyzeRepository(repoUrl, projectName, techStack, difficulty, category, cacheStatus = null) {
    if (!this.openRouterApiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    let tempRepoPath = null;
    const startTime = Date.now();
    
    try {
      // Create temporary directory
      await this.ensureDirectoryExists(this.tempDir);
      tempRepoPath = path.join(this.tempDir, `${Date.now()}_${Math.random().toString(36).substring(7)}`);
      
      // Clone repository
      await this.cloneRepository(repoUrl, tempRepoPath);
      
      // Extract code content
      const codeContent = await this.extractCodeContent(tempRepoPath);
      
      // Generate AI analysis with historical context
      const analysis = await this.generateAIAnalysis(
        codeContent, 
        projectName, 
        techStack, 
        difficulty, 
        category,
        cacheStatus?.cachedAnalysis || null
      );
      
      return {
        analysis,
        codeMetrics: {
          totalFiles: codeContent.totalFiles,
          totalLines: codeContent.totalLines,
          analyzedFiles: codeContent.files.length,
          languages: [...new Set(codeContent.files.map(f => path.extname(f.path).slice(1)).filter(Boolean))]
        },
        tokensUsed: analysis.tokensUsed || null,
        analysisTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in AI analysis:", error);
      throw new Error(`AI analysis failed: ${error.message}`);
    } finally {
      // Cleanup temporary directory
      if (tempRepoPath) {
        try {
          await execAsync(`rm -rf "${tempRepoPath}"`);
        } catch (cleanupError) {
          console.warn("Failed to cleanup temporary directory:", cleanupError);
        }
      }
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Clone repository to temporary location
   */
  async cloneRepository(repoUrl, targetPath) {
    try {
      // Clone with depth 1 to get latest commit only (faster)
      await execAsync(`git clone --depth 1 "${repoUrl}" "${targetPath}"`);
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  /**
   * Extract relevant code content from repository
   */
  async extractCodeContent(repoPath) {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.vue', '.svelte',
      '.html', '.css', '.scss', '.sass', '.less', '.sql', '.sh', '.bash',
      '.yaml', '.yml', '.json', '.xml', '.md'
    ];

    const ignorePatterns = [
      'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
      '__pycache__', '.pytest_cache', 'vendor', 'target', '.idea',
      '.vscode', '*.log', '*.lock', 'package-lock.json', 'yarn.lock'
    ];

    try {
      const files = await this.getRelevantFiles(repoPath, codeExtensions, ignorePatterns);
      const codeContent = await this.readFiles(files);
      
      // Get project structure
      const structure = await this.getProjectStructure(repoPath, ignorePatterns);
      
      return {
        files: codeContent,
        structure: structure,
        totalFiles: files.length,
        totalLines: codeContent.reduce((sum, file) => sum + file.lines, 0)
      };
    } catch (error) {
      throw new Error(`Failed to extract code content: ${error.message}`);
    }
  }

  /**
   * Get relevant files for analysis
   */
  async getRelevantFiles(dirPath, extensions, ignorePatterns) {
    const files = [];
    
    const findCommand = `find "${dirPath}" -type f \\( ${extensions.map(ext => `-name "*${ext}"`).join(' -o ')} \\) ${ignorePatterns.map(pattern => `! -path "*/${pattern}/*" ! -name "${pattern}"`).join(' ')} | head -100`;
    
    try {
      const { stdout } = await execAsync(findCommand);
      return stdout.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
      console.warn("Find command failed, falling back to manual search");
      return await this.findFilesManually(dirPath, extensions, ignorePatterns);
    }
  }

  /**
   * Manual file search fallback
   */
  async findFilesManually(dirPath, extensions, ignorePatterns) {
    const files = [];
    const maxFiles = 100;

    async function searchDir(currentPath) {
      if (files.length >= maxFiles) return;
      
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          const fullPath = path.join(currentPath, entry.name);
          
          // Skip ignored patterns
          if (ignorePatterns.some(pattern => entry.name.includes(pattern))) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await searchDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    await searchDir(dirPath);
    return files;
  }

  /**
   * Read file contents
   */
  async readFiles(filePaths) {
    const maxFileSize = 30000; // 30KB max per file (reduced)
    const contents = [];

    for (const filePath of filePaths.slice(0, 30)) { // Limit to 30 files (reduced)
      try {
        const stats = await fs.stat(filePath);
        if (stats.size > maxFileSize) continue; // Skip large files
        
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').length;
        
        contents.push({
          path: filePath,
          content: content.slice(0, 5000), // Limit content length to 5KB (reduced)
          lines: lines,
          size: stats.size
        });
      } catch (error) {
        // Skip files we can't read
        continue;
      }
    }

    return contents;
  }

  /**
   * Get project structure
   */
  async getProjectStructure(repoPath, ignorePatterns) {
    try {
      const treeCommand = `tree "${repoPath}" -I "${ignorePatterns.join('|')}" -L 3`;
      const { stdout } = await execAsync(treeCommand);
      return stdout;
    } catch (error) {
      // Fallback to basic ls structure
      try {
        const { stdout } = await execAsync(`find "${repoPath}" -type d -maxdepth 2 | head -20`);
        return stdout;
      } catch {
        return "Unable to generate project structure";
      }
    }
  }

  /**
   * Generate AI analysis using OpenRouter
   */
  async generateAIAnalysis(codeContent, projectName, techStack, difficulty, category, previousAnalysis = null) {
    const prompt = this.buildAnalysisPrompt(codeContent, projectName, techStack, difficulty, category, previousAnalysis);
    
    try {
      const response = await axios.post(
        `${this.openRouterBaseUrl}/chat/completions`,
        {
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content: "You are an expert code reviewer and software architect. Analyze the provided codebase and give detailed insights about code quality, architecture, security, performance, and maintainability. Return your response as a valid JSON object with the exact structure specified in the user prompt."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/your-repo', // Optional: for analytics
            'X-Title': this.appName // Optional: for analytics
          }
        }
      );

      const analysisText = response.data.choices[0].message.content;
      
      try {
        // Try to parse as JSON
        const analysis = JSON.parse(analysisText);
        return this.validateAndFormatAnalysis(analysis);
      } catch (parseError) {
        // If JSON parsing fails, extract information manually
        return this.parseAnalysisFromText(analysisText, projectName, techStack, difficulty, category);
      }
      
    } catch (error) {
      console.error("OpenRouter API error:", error.response?.data || error.message);
      
      // Handle specific OpenRouter errors
      if (error.response?.status === 402) {
        console.warn("Insufficient credits in OpenRouter account. Using fallback analysis.");
        throw new Error("Insufficient AI service credits. Please check your OpenRouter account balance at https://openrouter.ai/settings/credits");
      }
      
      if (error.response?.status === 429) {
        throw new Error("AI service rate limit exceeded. Please try again in a few minutes.");
      }
      
      if (error.response?.status === 401) {
        throw new Error("Invalid OpenRouter API key. Please check your configuration.");
      }
      
      // Return fallback analysis for other errors
      console.warn("Using fallback analysis due to API error:", error.message);
      return this.generateFallbackAnalysis(projectName, techStack, difficulty, category);
    }
  }

  /**
   * Build analysis prompt for AI models
   */
  buildAnalysisPrompt(codeContent, projectName, techStack, difficulty, category, previousAnalysis = null) {
    const filesSummary = codeContent.files.slice(0, 6).map(file => 
      `File: ${path.basename(file.path)}\nLines: ${file.lines}\nContent preview:\n${file.content.substring(0, 500)}...\n`
    ).join('\n---\n');

    // Add historical context if available
    const historicalContext = previousAnalysis ? 
      this.cacheService.generateHistoricalPrompt(previousAnalysis) : "";

    return `
Analyze this ${category} project "${projectName}" with tech stack: ${techStack.join(', ')} (Difficulty: ${difficulty}).

${historicalContext}

Project Structure:
${codeContent.structure}

Code Files (${codeContent.totalFiles} files, ${codeContent.totalLines} lines):
${filesSummary}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "codeQuality": <number 0-100>,
  "maintainability": <number 0-100>,
  "security": <number 0-100>,
  "performance": <number 0-100>,
  "documentation": <number 0-100>,
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    "specific actionable recommendation 3",
    "specific actionable recommendation 4",
    "specific actionable recommendation 5"
  ],
  "strengths": [
    "specific strength 1",
    "specific strength 2", 
    "specific strength 3",
    "specific strength 4",
    "specific strength 5"
  ],
  "improvements": [
    "specific improvement 1",
    "specific improvement 2",
    "specific improvement 3", 
    "specific improvement 4",
    "specific improvement 5"
  ],
  "techStackAnalysis": {
    "modern": ["list of modern technologies used"],
    "stable": ["list of stable technologies used"],
    "emerging": ["list of emerging technologies used"]
  }
}

Focus on:
- Code architecture and organization
- Error handling and edge cases
- Security vulnerabilities
- Performance bottlenecks
- Documentation quality
- Test coverage
- Dependency management
- Best practices adherence
`;
  }

  /**
   * Validate and format analysis response
   */
  validateAndFormatAnalysis(analysis) {
    const defaults = {
      overallScore: 70,
      codeQuality: 70,
      maintainability: 70,
      security: 70,
      performance: 70,
      documentation: 70,
      recommendations: [],
      strengths: [],
      improvements: [],
      techStackAnalysis: { modern: [], stable: [], emerging: [] }
    };

    return {
      ...defaults,
      ...analysis,
      overallScore: Math.min(100, Math.max(0, analysis.overallScore || defaults.overallScore)),
      codeQuality: Math.min(100, Math.max(0, analysis.codeQuality || defaults.codeQuality)),
      maintainability: Math.min(100, Math.max(0, analysis.maintainability || defaults.maintainability)),
      security: Math.min(100, Math.max(0, analysis.security || defaults.security)),
      performance: Math.min(100, Math.max(0, analysis.performance || defaults.performance)),
      documentation: Math.min(100, Math.max(0, analysis.documentation || defaults.documentation))
    };
  }

  /**
   * Parse analysis from text if JSON parsing fails
   */
  parseAnalysisFromText(text, projectName, techStack, difficulty, category) {
    // Extract scores using regex patterns
    const scoreRegex = /(\w+):\s*(\d+)/gi;
    const scores = {};
    let match;
    
    while ((match = scoreRegex.exec(text)) !== null) {
      scores[match[1].toLowerCase()] = parseInt(match[2]);
    }

    return {
      overallScore: scores.overall || scores.overallscore || 75,
      codeQuality: scores.code || scores.codequality || scores.quality || 75,
      maintainability: scores.maintainability || scores.maintain || 75,
      security: scores.security || 80,
      performance: scores.performance || 70,
      documentation: scores.documentation || scores.docs || 70,
      recommendations: this.extractListFromText(text, ['recommend', 'suggest', 'should']),
      strengths: this.extractListFromText(text, ['strength', 'good', 'well', 'excellent']),
      improvements: this.extractListFromText(text, ['improve', 'enhance', 'better', 'fix']),
      techStackAnalysis: {
        modern: techStack.filter(tech => ['React', 'Vue', 'Angular', 'Node.js', 'TypeScript', 'Next.js'].includes(tech)),
        stable: techStack.filter(tech => ['JavaScript', 'HTML', 'CSS', 'Python', 'Java'].includes(tech)),
        emerging: techStack.filter(tech => ['Svelte', 'Deno', 'WebAssembly', 'Rust'].includes(tech))
      }
    };
  }

  /**
   * Extract lists from analysis text
   */
  extractListFromText(text, keywords) {
    const sentences = text.split(/[.!?]+/);
    const items = [];
    
    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.length > 10 && cleanSentence.length < 200) {
          items.push(cleanSentence);
        }
      }
    }
    
    return items.slice(0, 5);
  }

  /**
   * Generate fallback analysis if AI fails
   */
  generateFallbackAnalysis(projectName, techStack, difficulty, category) {
    console.log("Generating fallback analysis for project:", projectName);
    const difficultyScores = {
      beginner: { base: 85, variation: 10 },
      intermediate: { base: 75, variation: 15 },
      advanced: { base: 70, variation: 20 }
    };

    const scores = difficultyScores[difficulty] || difficultyScores.intermediate;
    
    return {
      overallScore: scores.base + Math.floor(Math.random() * scores.variation) - scores.variation/2,
      codeQuality: scores.base + Math.floor(Math.random() * scores.variation) - scores.variation/2,
      maintainability: scores.base + Math.floor(Math.random() * scores.variation) - scores.variation/2,
      security: scores.base + 5 + Math.floor(Math.random() * 10),
      performance: scores.base - 5 + Math.floor(Math.random() * scores.variation),
      documentation: scores.base + Math.floor(Math.random() * scores.variation) - scores.variation/2,
      recommendations: [
        "Consider adding comprehensive error handling throughout the application",
        "Implement automated testing to improve code coverage and reliability",
        "Add detailed API documentation for better developer experience",
        "Consider implementing caching strategies for improved performance",
        "Review and enhance security practices, especially input validation"
      ],
      strengths: [
        `Well-organized project structure suitable for ${category} applications`,
        `Good choice of technology stack with ${techStack.join(', ')}`,
        `Project scope is appropriate for ${difficulty} level developers`,
        "Clear project setup and basic functionality implementation",
        "Follows standard conventions for the chosen technology stack"
      ],
      improvements: [
        "Increase test coverage to ensure code reliability",
        "Add performance monitoring and optimization",
        "Implement comprehensive error handling and logging",
        "Enhance documentation with examples and API references",
        "Consider adding accessibility features for better user experience"
      ],
      techStackAnalysis: {
        modern: techStack.filter(tech => 
          ['React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'Nuxt.js', 'Svelte'].includes(tech)
        ),
        stable: techStack.filter(tech => 
          ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Python', 'Java', 'PHP'].includes(tech)
        ),
        emerging: techStack.filter(tech => 
          ['Deno', 'Bun', 'WebAssembly', 'Rust', 'Go', 'Zig'].includes(tech)
        )
      }
    };
  }
}

export default AIAnalysisService;
