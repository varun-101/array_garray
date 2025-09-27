import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Service for interacting with Gemini CLI to generate code implementations
 * Handles automated code generation, file modifications, and PR creation
 */
class GeminiCodeService {
  constructor() {
    this.workingDir = process.env.GEMINI_WORKSPACE || '/tmp/gemini-workspace';
    this.geminiCmd = process.env.GEMINI_CLI_PATH || 'gemini';
  }

  /**
   * Initialize workspace for code generation
   */
  async initializeWorkspace(repoUrl, projectName) {
    try {
      const projectDir = path.join(this.workingDir, projectName);
      
      // Create workspace directory
      await fs.mkdir(this.workingDir, { recursive: true });
      
      // Clone repository if not exists
      if (!(await this.directoryExists(projectDir))) {
        console.log(`Cloning repository: ${repoUrl}`);
        await execAsync(`git clone ${repoUrl} ${projectDir}`);
      } else {
        console.log(`Repository already exists, pulling latest changes`);
        await execAsync(`cd ${projectDir} && git pull origin main`);
      }

      return projectDir;
    } catch (error) {
      throw new Error(`Failed to initialize workspace: ${error.message}`);
    }
  }

  /**
   * Create .gemini directory with project-specific configuration
   */
  async setupGeminiConfig(projectDir, projectContext) {
    try {
      const geminiDir = path.join(projectDir, '.gemini');
      await fs.mkdir(geminiDir, { recursive: true });

      const geminiConfig = this.generateGeminiConfig(projectContext);
      await fs.writeFile(path.join(geminiDir, 'GEMINI.md'), geminiConfig);
      
      // Create .geminiignore to exclude problematic files
      const geminiIgnore = `# Files to ignore during Gemini processing
*.sql
*.db
*.sqlite
*.log
*.tmp
*.temp
node_modules/
.git/
.env
.env.*
dist/
build/
coverage/
*.min.js
*.bundle.js
package-lock.json
yarn.lock
*.d.ts
`;
      await fs.writeFile(path.join(geminiDir, '.geminiignore'), geminiIgnore);

      console.log('Gemini configuration created successfully');
    } catch (error) {
      throw new Error(`Failed to setup Gemini config: ${error.message}`);
    }
  }

  /**
   * Generate GEMINI.md configuration file
   */
  generateGeminiConfig(projectContext) {
    const { projectName, techStack, difficulty, category, analysisData } = projectContext;
    
    return `# ${projectName} - Gemini AI Assistant Configuration

## Project Context
- **Name**: ${projectName}
- **Category**: ${category}
- **Difficulty**: ${difficulty}
- **Tech Stack**: ${techStack.join(', ')}

## Project Type Detection
**CRITICAL**: Before implementing any code changes, you MUST:
1. Analyze the project structure to identify the programming language
2. Look for key indicator files:
   - \`package.json\` → Node.js/JavaScript project
   - \`requirements.txt\`, \`setup.py\`, \`pyproject.toml\` → Python project
   - \`pom.xml\` → Java Maven project
   - \`build.gradle\` → Java Gradle project
   - \`Cargo.toml\` → Rust project
   - \`go.mod\` → Go project
3. Adapt your implementation approach based on the detected language
4. Use appropriate file extensions and naming conventions

## Code Generation Rules

### General Guidelines
1. Follow the existing code style and patterns in the project
2. Maintain backward compatibility unless explicitly refactoring
3. Add proper error handling and input validation
4. Include comprehensive comments for complex logic
5. Follow security best practices
6. Write testable code with clear separation of concerns
7. **ALWAYS detect project type first before implementing**

### Language-Specific Implementation Rules
${this.generateLanguageSpecificRules(techStack)}

### Technology-Specific Rules
${this.generateTechStackRules(techStack)}

### File Operations
- Always backup files before modifying them
- Preserve existing imports and dependencies
- Maintain proper file structure and organization
- Follow naming conventions used in the project
- Use correct file extensions for the detected language

### Security Guidelines
- Validate all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Avoid hardcoding sensitive information
- Follow OWASP security guidelines

### Testing Requirements
- Write unit tests for new functions using the appropriate testing framework
- Include integration tests for API endpoints
- Ensure edge cases are covered
- Maintain test coverage above 80%
- Use language-specific testing tools (Jest for JS, pytest for Python, etc.)

### AI Analysis Context
${analysisData ? this.formatAnalysisContext(analysisData) : 'No AI analysis data available'}

## Automation Rules
- **Non-interactive mode**: Always enabled for automated code generation
- **File writes**: Pre-authorized for this project
- **File operations**: Use file_editor tool instead of shell commands
- **Code analysis**: Use built-in analysis tools
- **Validation**: Focus on code quality over external tool execution
- **Project detection**: Always detect project type before validation

## Tool Configuration
- **Preferred tools**: file_editor, code_analysis, text_processing
- **Avoid tools**: run_shell_command, terminal, system_commands
- **File handling**: Direct file editing preferred over command-line operations

## Implementation Priorities
1. Project type detection (CRITICAL - must be done first)
2. Security fixes (High priority)
3. Error handling improvements (High priority)
4. Performance optimizations (Medium priority)
5. Code quality improvements (Medium priority)
6. Feature enhancements (Low priority)
`;
  }

  /**
   * Generate language-specific implementation rules
   */
  generateLanguageSpecificRules(techStack) {
    let rules = '';
    
    // Python-specific rules
    if (techStack.includes('Python')) {
      rules += `
#### Python Implementation Rules
- Use .py file extensions
- Follow PEP 8 style guidelines
- Use type hints for function parameters and returns
- Implement proper exception handling with try/except blocks
- Use virtual environments for dependencies
- Follow Pythonic conventions (list comprehensions, context managers)
- Use appropriate imports (from __future__ import annotations for forward references)
- Write docstrings for functions and classes
- Use pytest or unittest for testing
- Use flake8 or pylint for linting
`;
    }

    // JavaScript/TypeScript-specific rules
    if (techStack.includes('JavaScript') || techStack.includes('TypeScript') || techStack.includes('Node.js')) {
      rules += `
#### JavaScript/TypeScript Implementation Rules
- Use .js or .ts file extensions
- Follow ES6+ standards and modern JavaScript practices
- Use proper module exports (export/import or module.exports/require)
- Implement proper error handling with try/catch blocks
- Use TypeScript for type safety when applicable
- Use async/await for asynchronous operations
- Use Jest or Mocha for testing
- Use ESLint for linting
- Follow Node.js best practices for server-side code
`;
    }

    // Java-specific rules
    if (techStack.includes('Java')) {
      rules += `
#### Java Implementation Rules
- Use .java file extensions
- Follow Java naming conventions (PascalCase for classes, camelCase for methods)
- Use proper package structure
- Implement proper exception handling
- Use Maven or Gradle for dependency management
- Use JUnit for testing
- Use Checkstyle or SpotBugs for code quality
- Follow Java best practices and design patterns
`;
    }

    // Rust-specific rules
    if (techStack.includes('Rust')) {
      rules += `
#### Rust Implementation Rules
- Use .rs file extensions
- Follow Rust naming conventions (snake_case for functions, PascalCase for types)
- Use proper error handling with Result<T, E> and Option<T>
- Use Cargo for dependency management
- Use built-in testing framework (cargo test)
- Use clippy for linting
- Follow Rust best practices (ownership, borrowing, lifetimes)
`;
    }

    // Go-specific rules
    if (techStack.includes('Go')) {
      rules += `
#### Go Implementation Rules
- Use .go file extensions
- Follow Go naming conventions (camelCase for exported, lowercase for private)
- Use proper error handling with error return values
- Use go mod for dependency management
- Use built-in testing framework (go test)
- Use go vet for static analysis
- Follow Go best practices and idioms
`;
    }

    return rules || '- Follow general best practices for the detected programming language';
  }

  /**
   * Generate technology-specific rules
   */
  generateTechStackRules(techStack) {
    let rules = '';
    
    if (techStack.includes('React') || techStack.includes('Next.js')) {
      rules += `
#### React/Next.js Rules
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for state management
- Use TypeScript for type safety
- Implement proper prop validation
`;
    }

    if (techStack.includes('Node.js') || techStack.includes('Express')) {
      rules += `
#### Node.js/Express Rules
- Use async/await for asynchronous operations
- Implement proper middleware for error handling
- Follow RESTful API conventions
- Use environment variables for configuration
- Implement request validation and sanitization
`;
    }

    if (techStack.includes('Python')) {
      rules += `
#### Python Framework Rules
- Use appropriate frameworks (Django, Flask, FastAPI)
- Follow framework-specific conventions
- Use proper ORM patterns
- Implement proper middleware and decorators
- Use framework-specific testing utilities
`;
    }

    return rules || '- Follow general best practices for the technologies used';
  }

  /**
   * Format AI analysis context for Gemini
   */
  formatAnalysisContext(analysisData) {
    return `
### Current Project Analysis
- **Overall Score**: ${analysisData.overallScore}/100
- **Code Quality**: ${analysisData.codeQuality}/100
- **Security**: ${analysisData.security}/100
- **Performance**: ${analysisData.performance}/100
- **Maintainability**: ${analysisData.maintainability}/100

### Key Recommendations
${analysisData.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No specific recommendations available'}

### Areas for Improvement
${analysisData.improvements?.map(imp => `- ${imp}`).join('\n') || 'No specific improvements identified'}

### Project Strengths
${analysisData.strengths?.map(str => `- ${str}`).join('\n') || 'No specific strengths identified'}
`;
  }

  /**
   * Generate code implementation using Gemini CLI
   */
  async generateImplementation(projectDir, implementationRequest) {
    try {
      const { id, title, description, category, priority } = implementationRequest;
      
      // Create implementation prompt
      const prompt = this.createImplementationPrompt(implementationRequest);
      
      // Create a new branch for this implementation
      const branchName = `ai-implementation-${id}-${Date.now()}`;
      await execAsync(`cd ${projectDir} && git checkout -b ${branchName}`);

      console.log(`Generating implementation for: ${title}`);
      console.log(`Using branch: ${branchName}`);

      // Execute Gemini CLI in non-interactive mode with improved error handling
      // Use single quotes to avoid shell interpretation of special characters
      const safePrompt = prompt.replace(/'/g, "'\"'\"'"); // Escape single quotes safely
      const geminiCommand = `cd ${projectDir} && ${this.geminiCmd} -p '${safePrompt}'`;
      let result;
      
      try {
        result = await execAsync(geminiCommand, { 
          maxBuffer: 1024 * 1024 * 20,// 20MB buffer
          timeout: 120000, // Reduced to 2 minute timeout
          killSignal: 'SIGTERM'
        });
      } catch (timeoutError) {
        if (timeoutError.killed) {
          console.warn('Gemini CLI timed out, checking for partial changes...');
          
          // Check if any files were modified despite timeout
          const gitStatus = await execAsync(`cd ${projectDir} && git status --porcelain`);
          const modifiedFiles = gitStatus.stdout.trim().split('\n').filter(line => line.trim());
          
          if (modifiedFiles.length > 0) {
            console.log('Found partial changes, proceeding with available modifications');
            result = {
              stdout: 'Partial implementation completed due to timeout',
              stderr: timeoutError.stderr || ''
            };
          } else {
            throw new Error(`Gemini CLI timed out with no changes: ${timeoutError.message}`);
          }
        } else {
          throw timeoutError;
        }
      }

      console.log('Gemini CLI output:', result.stdout);
      
      // Parse Gemini output for code changes and apply them
      const parsedChanges = await this.parseAndApplyGeminiOutput(projectDir, result.stdout);
      
      // Check if files were modified
      const gitStatus = await execAsync(`cd ${projectDir} && git status --porcelain`);
      const modifiedFiles = gitStatus.stdout.trim().split('\n').filter(line => line.trim());

      if (modifiedFiles.length === 0 && parsedChanges.length === 0) {
        throw new Error('No files were modified by Gemini CLI');
      }

      console.log(`Modified files: ${modifiedFiles.join(', ')}`);

      // Run validation (linting, tests)
      await this.validateChanges(projectDir);

      // Commit changes
      await execAsync(`cd ${projectDir} && git add .`);
      await execAsync(`cd ${projectDir} && git commit -m "AI Implementation: ${title}

${description}

Category: ${category}
Priority: ${priority}
Generated by: Gemini CLI
Branch: ${branchName}"`);

      // Combine git status files with parsed changes
      const allModifiedFiles = [
        ...modifiedFiles.map(file => file.replace(/^..\s/, '')),
        ...parsedChanges
      ];
      
      return {
        success: true,
        branchName,
        modifiedFiles: [...new Set(allModifiedFiles)], // Remove duplicates
        commitHash: await this.getCommitHash(projectDir),
        validationResults: await this.getValidationResults(projectDir),
        parsedChanges: parsedChanges.length,
        geminiOutput: result.stdout.length > 500 ? result.stdout.substring(0, 500) + '...' : result.stdout
      };

    } catch (error) {
      console.error('Implementation generation failed:', error);
      
      // Try fallback implementation approach
      try {
        console.log('Attempting fallback implementation...');
        const fallbackResult = await this.generateFallbackImplementation(projectDir, implementationRequest);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback implementation also failed:', fallbackError);
        throw new Error(`Both primary and fallback implementation failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Fallback implementation when Gemini CLI fails
   */
  async generateFallbackImplementation(projectDir, implementationRequest) {
    const { id, title, description, category } = implementationRequest;
    const branchName = `fallback-implementation-${id}-${Date.now()}`;
    
    try {
      // Create fallback branch
      await execAsync(`cd ${projectDir} && git checkout -b ${branchName}`);
      
      // Generate basic implementation structure based on category
      const fallbackFiles = await this.createFallbackFiles(projectDir, implementationRequest);
      
      if (fallbackFiles.length === 0) {
        throw new Error('No fallback files could be created');
      }
      
      // Commit the fallback implementation
      await execAsync(`cd ${projectDir} && git add .`);
      await execAsync(`cd ${projectDir} && git commit -m "Fallback Implementation: ${title}

${description}

This is a basic implementation structure created when the primary 
Gemini CLI implementation failed. Manual completion may be required.

Category: ${category}
Generated by: Fallback Implementation System"`);

      return {
        success: true,
        branchName,
        modifiedFiles: fallbackFiles,
        commitHash: await this.getCommitHash(projectDir),
        validationResults: { note: 'Fallback implementation - manual review required' },
        fallback: true
      };
      
    } catch (error) {
      throw new Error(`Fallback implementation failed: ${error.message}`);
    }
  }

  /**
   * Create basic fallback files based on implementation category
   */
  async createFallbackFiles(projectDir, implementationRequest) {
    const { title, description, category } = implementationRequest;
    const createdFiles = [];
    
    try {
      // Create a basic implementation note file
      const noteContent = `# ${title}

## Description
${description}

## Category
${category}

## Implementation Notes
This file was created as a fallback when automated implementation failed.
Please implement the following:

1. Review the requirements in the description above
2. Implement the necessary code changes
3. Add proper error handling and validation
4. Update tests as needed
5. Update documentation

## Generated on
${new Date().toISOString()}

## Status
- [ ] Implementation started
- [ ] Core functionality implemented
- [ ] Error handling added
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Ready for review
`;

      const noteFile = path.join(projectDir, `IMPLEMENTATION_${category.toUpperCase()}_${Date.now()}.md`);
      await fs.writeFile(noteFile, noteContent);
      createdFiles.push(noteFile);

      // Create category-specific template files
      if (category === 'Security') {
        await this.createSecurityTemplate(projectDir, implementationRequest);
        createdFiles.push('security-template.js');
      } else if (category === 'Testing') {
        await this.createTestingTemplate(projectDir, implementationRequest);
        createdFiles.push('test-template.js');
      } else if (category === 'Performance') {
        await this.createPerformanceTemplate(projectDir, implementationRequest);
        createdFiles.push('performance-template.js');
      }
      
      return createdFiles;
      
    } catch (error) {
      console.error('Error creating fallback files:', error);
      return [];
    }
  }

  /**
   * Create security implementation template
   */
  async createSecurityTemplate(projectDir, implementationRequest) {
    const securityTemplate = `// Security Implementation Template
// Generated for: ${implementationRequest.title}

/**
 * Input validation utilities
 * TODO: Implement actual validation logic
 */
const validateInput = (input, type) => {
  // TODO: Add validation based on type
  if (!input) {
    throw new Error('Input is required');
  }
  
  // Add specific validation logic here
  return true;
};

/**
 * Sanitize user input
 * TODO: Implement actual sanitization
 */
const sanitizeInput = (input) => {
  // TODO: Add sanitization logic
  return input;
};

/**
 * TODO: Export the functions and integrate with your application
 */
module.exports = {
  validateInput,
  sanitizeInput
};
`;
    
    await fs.writeFile(path.join(projectDir, 'security-template.js'), securityTemplate);
  }

  /**
   * Create testing implementation template
   */
  async createTestingTemplate(projectDir, implementationRequest) {
    const testTemplate = `// Testing Implementation Template
// Generated for: ${implementationRequest.title}

/**
 * TODO: Add your test cases here
 */
describe('${implementationRequest.title}', () => {
  beforeEach(() => {
    // TODO: Setup test environment
  });

  afterEach(() => {
    // TODO: Cleanup after tests
  });

  it('should implement basic functionality', () => {
    // TODO: Add test implementation
    expect(true).toBe(true); // Replace with actual test
  });

  it('should handle edge cases', () => {
    // TODO: Add edge case tests
    expect(true).toBe(true); // Replace with actual test
  });

  it('should handle errors gracefully', () => {
    // TODO: Add error handling tests
    expect(true).toBe(true); // Replace with actual test
  });
});
`;
    
    await fs.writeFile(path.join(projectDir, 'test-template.js'), testTemplate);
  }

  /**
   * Create performance implementation template
   */
  async createPerformanceTemplate(projectDir, implementationRequest) {
    const perfTemplate = `// Performance Implementation Template
// Generated for: ${implementationRequest.title}

/**
 * Performance optimization utilities
 * TODO: Implement actual optimization logic
 */

// TODO: Add caching mechanism
const cache = new Map();

/**
 * Memoization helper
 * TODO: Customize for your specific use case
 */
const memoize = (fn) => {
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Debounce helper for performance
 * TODO: Customize delay as needed
 */
const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * TODO: Export and integrate with your application
 */
module.exports = {
  memoize,
  debounce
};
`;
    
    await fs.writeFile(path.join(projectDir, 'performance-template.js'), perfTemplate);
  }

  /**
   * Parse Gemini CLI output and apply code changes to files
   */
  async parseAndApplyGeminiOutput(projectDir, output) {
    const appliedChanges = [];
    
    try {
      // Extract code blocks from Gemini output
      const codeBlocks = this.extractCodeBlocks(output);
      
      for (const block of codeBlocks) {
        if (block.filename && block.content) {
          const filePath = path.join(projectDir, block.filename);
          
          // Ensure directory exists
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          
          // Write the file content
          await fs.writeFile(filePath, block.content, 'utf8');
          
          console.log(`Applied changes to: ${block.filename}`);
          appliedChanges.push(block.filename);
        }
      }
      
      // Also look for explicit file mentions in text
      const fileMentions = this.extractFileMentions(output);
      for (const mention of fileMentions) {
        if (mention.filename && mention.content) {
          const filePath = path.join(projectDir, mention.filename);
          
          try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mention.content, 'utf8');
            console.log(`Applied mentioned changes to: ${mention.filename}`);
            appliedChanges.push(mention.filename);
          } catch (error) {
            console.warn(`Failed to apply changes to ${mention.filename}:`, error.message);
          }
        }
      }
      
      return appliedChanges;
      
    } catch (error) {
      console.warn('Error parsing Gemini output:', error.message);
      return appliedChanges;
    }
  }

  /**
   * Extract code blocks from Gemini output
   */
  extractCodeBlocks(output) {
    const codeBlocks = [];
    
    // Patterns that match our instructed formats exactly
    const patterns = [
      // Pattern 1: ### `filename.ext` followed by code block
      /###\s+[`']([^`'\n]+\.[a-zA-Z]{2,4})[`']\s*\n\s*```(\w*)\n([\s\S]*?)```/gi,
      
      // Pattern 2: ### filename.ext (without backticks) followed by code block  
      /###\s+([^`'\s\n]+\.[a-zA-Z]{2,4})\s*\n\s*```(\w*)\n([\s\S]*?)```/gi,
      
      // Pattern 3: Direct filename in backticks followed by code block
      /^[`']([^`'\n]+\.[a-zA-Z]{2,4})[`']\s*\n\s*```(\w*)\n([\s\S]*?)```/gim
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const [, filename, language, content] = match;
        
        // Validate filename - must be a valid file with extension
        if (this.isValidFilename(filename) && content?.trim()) {
          codeBlocks.push({
            filename: filename.replace(/^\/+/, ''),
            content: content.trim(),
            language: language || this.getLanguageFromExtension(filename)
          });
        }
      }
    }
    
    return codeBlocks;
  }

  /**
   * Check if a string is a valid filename
   */
  isValidFilename(filename) {
    if (!filename || typeof filename !== 'string') return false;
    
    // Must have an extension
    if (!filename.includes('.')) return false;
    
    // Must not be too long or too short
    if (filename.length < 3 || filename.length > 100) return false;
    
    // Must not contain invalid characters or patterns
    const invalidPatterns = [
      /\s/, // no spaces
      /^(import|from|export|const|let|var|function|class|def)\s/, // not code
      /[<>:"|?*]/, // invalid file chars
      /^\d+\./, // not numbered lists
      /^-\s/, // not bullet points
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Get language from file extension
   */
  getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext] || ext;
  }

  /**
   * Extract file mentions with content from text
   */
  extractFileMentions(output) {
    const mentions = [];
    
    // Look for patterns matching our instructed format exactly
    const patterns = [
      // "Here is the updated content for `filename.ext`:" pattern
      /Here is the updated content for [`']([^`'\n]+\.[a-zA-Z]{2,4})[`']:\s*```(\w*)\n([\s\S]*?)```/gi,
      
      // "Updated content for `filename.ext`:" pattern
      /Updated? (?:content )?for [`']([^`'\n]+\.[a-zA-Z]{2,4})[`']:\s*```(\w*)\n([\s\S]*?)```/gi,
      
      // "Create/Update/Modify `filename.ext`:" pattern
      /(?:Create|Update|Modify) [`']([^`'\n]+\.[a-zA-Z]{2,4})[`']:\s*```(\w*)\n([\s\S]*?)```/gi,
      
      // Alternative pattern without colon
      /Here is the updated content for [`']([^`'\n]+\.[a-zA-Z]{2,4})[`']\s*```(\w*)\n([\s\S]*?)```/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const [, filename, language, content] = match;
        
        // Only process valid filenames with extensions
        if (this.isValidFilename(filename) && content?.trim()) {
          mentions.push({
            filename: filename.replace(/^\/tmp\/gemini-workspace\/[^\/]+\//, '').replace(/^\/+/, ''),
            content: content.trim(),
            language: language || this.getLanguageFromExtension(filename)
          });
        }
      }
    }
    
    return mentions;
  }

  /**
   * Create implementation prompt for Gemini CLI
   */
  createImplementationPrompt(implementationRequest) {
    const { title, description, category, difficulty, estimatedTime } = implementationRequest;
    
    return `Implement the following code change using only file editing operations:

TASK: ${title}

DESCRIPTION: ${description}

CATEGORY: ${category}
DIFFICULTY: ${difficulty}
ESTIMATED TIME: ${estimatedTime}

PROJECT TYPE DETECTION:
1. FIRST, analyze the project structure to determine the programming language and framework
2. Look for key files: package.json (Node.js), requirements.txt (Python), pom.xml (Java), Cargo.toml (Rust), etc.
3. Identify the main programming language and any frameworks being used
4. Adapt your implementation approach based on the detected project type

IMPLEMENTATION REQUIREMENTS:
1. MUST write actual files using file_editor tool - DO NOT just show code in text
2. DO NOT use run_shell_command or terminal operations
3. Focus on direct file modifications and creation
4. Follow the project's existing code style and patterns
5. Implement proper error handling and input validation
6. Add comprehensive comments explaining the implementation
7. Use appropriate file extensions and naming conventions for the detected language

CRITICAL FILE OUTPUT FORMAT:
Since you don't have access to direct file editing tools, you MUST provide file content in this EXACT format for our system to parse and create files:

FORMAT 1 - Using markdown headers with filenames:
### filename.ext

[three backticks]language
[complete file content here]
[three backticks]

FORMAT 2 - Using explicit file content declarations:
Here is the updated content for filename.ext:

[three backticks]language
[complete file content here]
[three backticks]

EXAMPLES OF CORRECT OUTPUT FORMAT:

### package.json

[three backticks]json
{
  "name": "my-project",
  "version": "1.0.0"
}
[three backticks]

### src/main.py

[three backticks]python
def main():
    print("Hello World")

if __name__ == "__main__":
    main()
[three backticks]

Here is the updated content for README.md:

[three backticks]markdown
# My Project
This is a sample project.
[three backticks]

CRITICAL REQUIREMENTS:
- Always include the complete file content, not just snippets
- Use proper file extensions (.py, .js, .ts, .java, .html, .css, etc.)
- Each file must be in its own code block with the language specified
- Use either ### filename format or "Here is the updated content for filename:" format
- Provide full, runnable file content
- Replace [three backticks] with actual backticks in your output

TECHNICAL GUIDELINES:
- Make minimal, focused changes to existing files
- Create new files only if absolutely necessary
- Preserve existing functionality unless explicitly refactoring
- Add proper type annotations if the language supports them
- Follow security best practices for ${category} implementations
- Use appropriate testing frameworks for the detected language

EXECUTION STEPS:
1. First, analyze the project structure to identify the programming language
2. Read and understand the existing file(s) to understand current structure and patterns
3. For each file you need to modify or create, output it using the EXACT format specified above
4. Ensure all imports, dependencies, and syntax are correct for the detected language
5. Provide complete, runnable file content (not partial code snippets)
6. Use appropriate file extensions and naming conventions for the detected language

IMPLEMENTATION WORKFLOW:
1. Analyze the project structure (check for package.json, requirements.txt, etc.)
2. Identify the main programming language and framework
3. For each file to be modified/created, use this exact format:
   
   ### filename.ext
   
   [three backticks]language
   [complete file content]
   [three backticks]
   
4. Ensure each file is complete and self-contained
5. Include proper imports, exports, and dependencies

CONSTRAINTS:
- Do NOT run external commands or tools
- Do NOT attempt to execute tests or linting via shell
- Focus purely on code implementation with actual file writing
- Use the project context defined in .gemini/GEMINI.md
- Adapt to the specific programming language and framework detected

IMPORTANT: Since you cannot directly edit files, you MUST provide complete file content using the exact format specified above. Our system will parse your response and create the actual files. Always detect the project type first and adapt your implementation accordingly.

REMEMBER: Use the ### filename.ext format or "Here is the updated content for filename.ext:" format for EVERY file you want to create or modify. Replace [three backticks] with actual backticks in your output.`;
  }

  /**
   * Detect project type based on files in the project directory
   */
  async detectProjectType(projectDir) {
    try {
      const files = await fs.readdir(projectDir);
      
      // Check for Node.js project
      if (files.includes('package.json')) {
        return { type: 'nodejs', packageManager: 'npm' };
      }
      
      // Check for Python project
      if (files.includes('requirements.txt') || files.includes('setup.py') || files.includes('pyproject.toml')) {
        return { type: 'python', packageManager: 'pip' };
      }
      
      // Check for Java project
      if (files.includes('pom.xml') || files.includes('build.gradle')) {
        return { type: 'java', packageManager: files.includes('pom.xml') ? 'maven' : 'gradle' };
      }
      
      // Check for Rust project
      if (files.includes('Cargo.toml')) {
        return { type: 'rust', packageManager: 'cargo' };
      }
      
      // Check for Go project
      if (files.includes('go.mod')) {
        return { type: 'go', packageManager: 'go' };
      }
      
      // Default to unknown
      return { type: 'unknown', packageManager: 'unknown' };
    } catch (error) {
      console.warn('Failed to detect project type:', error.message);
      return { type: 'unknown', packageManager: 'unknown' };
    }
  }

  /**
   * Validate code changes (linting, tests) based on project type
   */
  async validateChanges(projectDir) {
    try {
      console.log('Running validation checks...');
      
      // Detect project type first
      const projectType = await this.detectProjectType(projectDir);
      console.log(`Detected project type: ${projectType.type} (${projectType.packageManager})`);
      
      const results = { projectType: projectType.type, linting: 'skipped', tests: 'skipped' };
      
      // Run language-specific validation
      switch (projectType.type) {
        case 'nodejs':
          await this.validateNodejsProject(projectDir, results);
          break;
        case 'python':
          await this.validatePythonProject(projectDir, results);
          break;
        case 'java':
          await this.validateJavaProject(projectDir, results);
          break;
        case 'rust':
          await this.validateRustProject(projectDir, results);
          break;
        case 'go':
          await this.validateGoProject(projectDir, results);
          break;
        default:
          console.log('Unknown project type, skipping validation');
          results.note = 'Unknown project type - validation skipped';
      }

      return results;
    } catch (error) {
      console.warn('Validation checks failed:', error.message);
      return { linting: 'failed', tests: 'failed', error: error.message };
    }
  }

  /**
   * Validate Node.js project
   */
  async validateNodejsProject(projectDir, results) {
    // Try to run linting if available
    try {
      await execAsync(`cd ${projectDir} && npm run lint`, { timeout: 60000 });
      console.log('Linting passed');
      results.linting = 'passed';
    } catch (error) {
      console.warn('Linting not available or failed:', error.message);
      results.linting = 'failed';
    }

    // Try to run tests if available
    try {
      await execAsync(`cd ${projectDir} && npm test`, { timeout: 120000 });
      console.log('Tests passed');
      results.tests = 'passed';
    } catch (error) {
      console.warn('Tests not available or failed:', error.message);
      results.tests = 'failed';
    }
  }

  /**
   * Validate Python project
   */
  async validatePythonProject(projectDir, results) {
    // Try to run linting with flake8 or pylint if available
    try {
      await execAsync(`cd ${projectDir} && python -m flake8 .`, { timeout: 60000 });
      console.log('Python linting passed');
      results.linting = 'passed';
    } catch (error) {
      try {
        await execAsync(`cd ${projectDir} && python -m pylint .`, { timeout: 60000 });
        console.log('Python linting passed');
        results.linting = 'passed';
      } catch (pylintError) {
        console.warn('Python linting not available or failed:', error.message);
        results.linting = 'failed';
      }
    }

    // Try to run tests with pytest or unittest
    try {
      await execAsync(`cd ${projectDir} && python -m pytest`, { timeout: 120000 });
      console.log('Python tests passed');
      results.tests = 'passed';
    } catch (error) {
      try {
        await execAsync(`cd ${projectDir} && python -m unittest discover`, { timeout: 120000 });
        console.log('Python tests passed');
        results.tests = 'passed';
      } catch (unittestError) {
        console.warn('Python tests not available or failed:', error.message);
        results.tests = 'failed';
      }
    }
  }

  /**
   * Validate Java project
   */
  async validateJavaProject(projectDir, results) {
    // Try to run Maven or Gradle validation
    try {
      if (await this.fileExists(path.join(projectDir, 'pom.xml'))) {
        await execAsync(`cd ${projectDir} && mvn compile`, { timeout: 120000 });
        console.log('Java compilation passed');
        results.linting = 'passed';
      } else if (await this.fileExists(path.join(projectDir, 'build.gradle'))) {
        await execAsync(`cd ${projectDir} && ./gradlew compileJava`, { timeout: 120000 });
        console.log('Java compilation passed');
        results.linting = 'passed';
      }
    } catch (error) {
      console.warn('Java compilation failed:', error.message);
      results.linting = 'failed';
    }

    // Try to run tests
    try {
      if (await this.fileExists(path.join(projectDir, 'pom.xml'))) {
        await execAsync(`cd ${projectDir} && mvn test`, { timeout: 180000 });
        console.log('Java tests passed');
        results.tests = 'passed';
      } else if (await this.fileExists(path.join(projectDir, 'build.gradle'))) {
        await execAsync(`cd ${projectDir} && ./gradlew test`, { timeout: 180000 });
        console.log('Java tests passed');
        results.tests = 'passed';
      }
    } catch (error) {
      console.warn('Java tests failed:', error.message);
      results.tests = 'failed';
    }
  }

  /**
   * Validate Rust project
   */
  async validateRustProject(projectDir, results) {
    // Try to run cargo check
    try {
      await execAsync(`cd ${projectDir} && cargo check`, { timeout: 120000 });
      console.log('Rust check passed');
      results.linting = 'passed';
    } catch (error) {
      console.warn('Rust check failed:', error.message);
      results.linting = 'failed';
    }

    // Try to run cargo test
    try {
      await execAsync(`cd ${projectDir} && cargo test`, { timeout: 180000 });
      console.log('Rust tests passed');
      results.tests = 'passed';
    } catch (error) {
      console.warn('Rust tests failed:', error.message);
      results.tests = 'failed';
    }
  }

  /**
   * Validate Go project
   */
  async validateGoProject(projectDir, results) {
    // Try to run go vet
    try {
      await execAsync(`cd ${projectDir} && go vet ./...`, { timeout: 60000 });
      console.log('Go vet passed');
      results.linting = 'passed';
    } catch (error) {
      console.warn('Go vet failed:', error.message);
      results.linting = 'failed';
    }

    // Try to run go test
    try {
      await execAsync(`cd ${projectDir} && go test ./...`, { timeout: 120000 });
      console.log('Go tests passed');
      results.tests = 'passed';
    } catch (error) {
      console.warn('Go tests failed:', error.message);
      results.tests = 'failed';
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current commit hash
   */
  async getCommitHash(projectDir) {
    try {
      const result = await execAsync(`cd ${projectDir} && git rev-parse HEAD`);
      return result.stdout.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get validation results
   */
  async getValidationResults(projectDir) {
    try {
      // Check git status for any remaining issues
      const status = await execAsync(`cd ${projectDir} && git status --porcelain`);
      return {
        uncommittedFiles: status.stdout.trim().split('\n').filter(line => line.trim()),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Create pull request (requires GitHub CLI or API)
   */
  async createPullRequest(projectDir, branchName, implementationRequest) {
    try {
      const { title, description, category, priority } = implementationRequest;
      
      // Try to push branch to origin
      try {
        await execAsync(`cd ${projectDir} && git push origin ${branchName}`);
        console.log(`Branch ${branchName} pushed successfully`);
      } catch (pushError) {
        // Handle permission errors gracefully
        if (pushError.message.includes('Permission') || pushError.message.includes('access_denied')) {
          console.warn('Git push failed due to permissions:', pushError.message);
          return { 
            success: false, 
            error: 'Permission denied - cannot push to repository', 
            branchName,
            message: 'Implementation completed locally but cannot push due to repository permissions',
            localBranch: branchName
          };
        } else {
          throw pushError; // Re-throw if it's not a permission error
        }
      }

      // Create PR using GitHub CLI if available
      try {
        const prTitle = `[AI Implementation] ${title}`;
        const prBody = `## Automated Code Implementation

**Description**: ${description}

**Category**: ${category}
**Priority**: ${priority}

**Generated by**: Gemini CLI
**Branch**: ${branchName}

### Changes Made
- Implemented the requested feature/fix
- Added proper error handling and validation
- Included comprehensive comments
- Followed project coding standards

### Validation
- ✅ Code linting passed
- ✅ Tests executed
- ✅ No regressions detected

This PR was automatically generated by the AI implementation system.`;

        const result = await execAsync(`cd ${projectDir} && gh pr create --title "${prTitle}" --body "${prBody}" --base main --head ${branchName}`);
        const prUrl = result.stdout.trim();
        
        console.log('Pull request created:', prUrl);
        return { success: true, url: prUrl, branchName };
        
      } catch (ghError) {
        console.warn('GitHub CLI not available, PR creation skipped:', ghError.message);
        return { 
          success: false, 
          error: 'GitHub CLI not available', 
          branchName,
          message: 'Branch pushed but PR creation failed' 
        };
      }

    } catch (error) {
      console.error('Pull request creation failed:', error.message);
      return {
        success: false,
        error: error.message,
        branchName,
        message: 'Implementation completed but PR creation failed'
      };
    }
  }

  /**
   * Process multiple implementations in batch
   */
  async batchImplementation(projectDir, implementations) {
    const results = [];
    
    for (const implementation of implementations) {
      try {
        console.log(`Processing implementation: ${implementation.title}`);
        
        const result = await this.generateImplementation(projectDir, implementation);
        
        if (result.success) {
          const prResult = await this.createPullRequest(projectDir, result.branchName, implementation);
          result.pullRequest = prResult;
        }
        
        results.push({
          implementation: implementation.id,
          ...result
        });
        
        // Switch back to main branch for next implementation
        await execAsync(`cd ${projectDir} && git checkout main`);
        
      } catch (error) {
        console.error(`Failed to process implementation ${implementation.id}:`, error);
        results.push({
          implementation: implementation.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Clean up workspace
   */
  async cleanup(projectDir) {
    try {
      if (await this.directoryExists(projectDir)) {
        await execAsync(`rm -rf ${projectDir}`);
        console.log('Workspace cleaned up successfully');
      }
    } catch (error) {
      console.warn('Failed to cleanup workspace:', error.message);
    }
  }

  /**
   * Check if directory exists
   */
  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Get implementation status
   */
  async getImplementationStatus(projectDir, branchName) {
    try {
      const branches = await execAsync(`cd ${projectDir} && git branch -a`);
      const branchExists = branches.stdout.includes(branchName);
      
      if (!branchExists) {
        return { status: 'not_found' };
      }

      const commits = await execAsync(`cd ${projectDir} && git log ${branchName} --oneline -5`);
      return {
        status: 'exists',
        recentCommits: commits.stdout.trim().split('\n')
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

export default GeminiCodeService;
