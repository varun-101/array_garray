#!/usr/bin/env node

/**
 * Setup script for Gemini CLI configuration
 * This script creates the .gemini directory with project-specific rules
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default Gemini configuration template
 */
const DEFAULT_GEMINI_CONFIG = `# Gemini AI Assistant Configuration

## Project Context
This is an automated code generation project using Gemini CLI for implementing AI-recommended improvements.

## Code Generation Rules

### General Guidelines
1. **Code Style**: Follow the existing code style and patterns in the project
2. **Backward Compatibility**: Maintain backward compatibility unless explicitly refactoring
3. **Error Handling**: Add proper error handling and input validation
4. **Documentation**: Include comprehensive comments for complex logic
5. **Security**: Follow security best practices
6. **Testing**: Write testable code with clear separation of concerns

### File Operations
- Always backup files before modifying them
- Preserve existing imports and dependencies
- Maintain proper file structure and organization
- Follow naming conventions used in the project

### Security Guidelines
- Validate all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Avoid hardcoding sensitive information
- Follow OWASP security guidelines

### Testing Requirements
- Write unit tests for new functions
- Include integration tests for API endpoints
- Ensure edge cases are covered
- Maintain test coverage above 80%

## Technology-Specific Rules

### JavaScript/Node.js
- Use modern ES6+ syntax
- Prefer async/await over callbacks
- Use const/let instead of var
- Implement proper error handling with try-catch
- Follow JSDoc commenting standards

### React/Frontend
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for state management
- Use TypeScript for type safety when available
- Implement proper prop validation

### Express/API
- Use middleware for cross-cutting concerns
- Implement proper request validation
- Follow RESTful conventions
- Use environment variables for configuration
- Implement rate limiting and security headers

### Database
- Use parameterized queries
- Implement proper connection pooling
- Handle database errors gracefully
- Use transactions for multi-step operations
- Index frequently queried fields

## Automation Rules
- **Non-interactive mode**: Always enabled for automated code generation
- **File writes**: Pre-authorized for this project
- **Shell operations**: Pre-authorized for git operations and package management
- **Validation**: Run linting and tests after each change

## Implementation Priorities
1. Security fixes (High priority)
2. Error handling improvements (High priority)  
3. Performance optimizations (Medium priority)
4. Code quality improvements (Medium priority)
5. Feature enhancements (Low priority)

## Code Review Guidelines
- All generated code should be production-ready
- Changes should be minimal and focused
- Preserve existing functionality unless explicitly changing it
- Add appropriate logging for debugging
- Consider performance implications of changes

## Git Workflow
- Create feature branches for each implementation
- Use descriptive commit messages
- Include implementation details in commit body
- Reference related issues or tickets
- Ensure branch names follow convention: ai-implementation-{feature-name}

## Environment Setup
- Ensure all dependencies are installed
- Check that linting tools are configured
- Verify test frameworks are available
- Confirm Git is properly configured
- Check for required environment variables
`;

/**
 * Create .gemini directory and configuration
 */
async function setupGeminiConfig(projectPath = process.cwd(), customConfig = null) {
  try {
    const geminiDir = path.join(projectPath, '.gemini');
    const configPath = path.join(geminiDir, 'GEMINI.md');
    
    // Create .gemini directory if it doesn't exist
    await fs.mkdir(geminiDir, { recursive: true });
    
    // Check if config already exists
    let configExists = false;
    try {
      await fs.access(configPath);
      configExists = true;
    } catch {
      // Config doesn't exist, which is fine
    }
    
    if (configExists) {
      console.log('⚠️  GEMINI.md already exists. Backing up existing file...');
      const backupPath = path.join(geminiDir, `GEMINI.md.backup.${Date.now()}`);
      await fs.copyFile(configPath, backupPath);
      console.log(`📄 Backup created: ${backupPath}`);
    }
    
    // Write configuration
    const configContent = customConfig || DEFAULT_GEMINI_CONFIG;
    await fs.writeFile(configPath, configContent, 'utf8');
    
    console.log('✅ Gemini configuration created successfully!');
    console.log(`📁 Location: ${configPath}`);
    
    // Create additional helpful files
    await createHelpfulFiles(geminiDir);
    
    return {
      success: true,
      configPath,
      geminiDir
    };
    
  } catch (error) {
    console.error('❌ Failed to setup Gemini configuration:', error.message);
    throw error;
  }
}

/**
 * Create additional helpful files
 */
async function createHelpfulFiles(geminiDir) {
  try {
    // Create .gitignore for gemini directory
    const gitignorePath = path.join(geminiDir, '.gitignore');
    const gitignoreContent = `# Gemini temporary files
*.tmp
*.temp
gemini-*.log

# Backup files
*.backup.*

# Local configuration overrides
GEMINI.local.md
`;
    await fs.writeFile(gitignorePath, gitignoreContent);
    
    // Create README for the .gemini directory
    const readmePath = path.join(geminiDir, 'README.md');
    const readmeContent = `# Gemini AI Configuration

This directory contains configuration and rules for Gemini AI code generation.

## Files

- **GEMINI.md** - Main configuration file with project-specific rules
- **README.md** - This file, explaining the setup
- **.gitignore** - Git ignore rules for temporary files

## Usage

The Gemini CLI will automatically read the GEMINI.md file when running in this project directory. The configuration ensures:

1. Generated code follows project conventions
2. Security and best practices are enforced
3. Non-interactive mode is properly configured
4. File operations are pre-authorized

## Customization

You can modify GEMINI.md to add project-specific rules, coding standards, or additional context that will help Gemini generate better code for your project.

## Automation

This configuration is designed to work with the automated code implementation system that:

1. Analyzes your code with AI
2. Generates implementation recommendations  
3. Uses Gemini CLI to implement changes
4. Creates pull requests automatically

For more information, see the main project documentation.
`;
    await fs.writeFile(readmePath, readmeContent);
    
    console.log('📚 Additional helpful files created');
    
  } catch (error) {
    console.warn('⚠️  Failed to create additional files:', error.message);
  }
}

/**
 * Generate project-specific configuration
 */
function generateProjectConfig(projectContext) {
  const { projectName, techStack, difficulty, category, analysisData } = projectContext;
  
  let config = DEFAULT_GEMINI_CONFIG;
  
  // Replace project context section
  const projectSection = `# ${projectName} - Gemini AI Assistant Configuration

## Project Context
- **Name**: ${projectName}
- **Category**: ${category}
- **Difficulty**: ${difficulty}  
- **Tech Stack**: ${techStack.join(', ')}

## AI Analysis Context
${analysisData ? formatAnalysisContext(analysisData) : 'No AI analysis data available yet. Run AI analysis first for personalized recommendations.'}
`;
  
  // Replace the default header with project-specific info
  config = config.replace(/^# Gemini AI Assistant Configuration[\s\S]*?## Code Generation Rules/m, 
    projectSection + '\n## Code Generation Rules');
  
  return config;
}

/**
 * Format AI analysis context
 */
function formatAnalysisContext(analysisData) {
  return `
### Current Project Analysis
- **Overall Score**: ${analysisData.overallScore || 'N/A'}/100
- **Code Quality**: ${analysisData.codeQuality || 'N/A'}/100
- **Security**: ${analysisData.security || 'N/A'}/100
- **Performance**: ${analysisData.performance || 'N/A'}/100
- **Maintainability**: ${analysisData.maintainability || 'N/A'}/100

### Key Recommendations
${analysisData.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No specific recommendations available'}

### Areas for Improvement  
${analysisData.improvements?.map(imp => `- ${imp}`).join('\n') || 'No specific improvements identified'}

### Project Strengths
${analysisData.strengths?.map(str => `- ${str}`).join('\n') || 'No specific strengths identified'}
`;
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const projectPath = args[0] || process.cwd();
  
  console.log('🚀 Setting up Gemini AI configuration...');
  console.log(`📂 Project path: ${projectPath}`);
  
  try {
    const result = await setupGeminiConfig(projectPath);
    console.log('\n🎉 Setup complete! Your project is now ready for automated code generation.');
    console.log('\n📋 Next steps:');
    console.log('1. Install Gemini CLI if not already installed');
    console.log('2. Run AI analysis on your project');
    console.log('3. Use the implementation endpoints to generate code');
    console.log('4. Review and merge the generated pull requests');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use as module
export {
  setupGeminiConfig,
  generateProjectConfig,
  formatAnalysisContext,
  DEFAULT_GEMINI_CONFIG
};

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
