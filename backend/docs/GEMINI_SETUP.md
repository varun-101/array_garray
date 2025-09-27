# Gemini CLI Setup Guide

This guide will help you set up the automated code implementation system using Gemini CLI.

## Prerequisites

### 1. Install Gemini CLI

```bash
# Install Gemini CLI (replace with actual installation method)
npm install -g @google-ai/gemini-cli
# or
pip install gemini-cli
# or download from official releases
```

### 2. Environment Variables

Add these environment variables to your `.env` file:

```env
# Gemini CLI Configuration
GEMINI_CLI_PATH=gemini                    # Path to Gemini CLI executable
GEMINI_WORKSPACE=/tmp/gemini-workspace    # Working directory for code generation
GEMINI_API_KEY=your_gemini_api_key       # Gemini API key

# GitHub Configuration (for PR creation)
GITHUB_TOKEN=your_github_token            # GitHub personal access token
GITHUB_CLI_PATH=gh                        # Path to GitHub CLI (optional)

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379          # Redis connection URL
```

### 3. System Dependencies

```bash
# Install Git (required for repository operations)
sudo apt-get install git

# Install GitHub CLI (optional, for PR creation)
sudo apt-get install gh

# Or on macOS
brew install git gh
```

## API Endpoints

### 1. Generate Single Implementation

**POST** `/api/implementation/generate`

Generate code implementation for a single AI recommendation.

```json
{
  "repoUrl": "https://github.com/username/repository",
  "projectName": "My Project",
  "techStack": ["React", "Node.js", "TypeScript"],
  "difficulty": "intermediate",
  "category": "Web Development",
  "implementation": {
    "id": "error-handling",
    "title": "Implement Comprehensive Error Handling",
    "description": "Add try-catch blocks and proper error boundaries to handle runtime errors gracefully.",
    "category": "Quality",
    "priority": "High",
    "difficulty": "Intermediate",
    "estimatedTime": "2-3 hours"
  },
  "analysisData": {
    "overallScore": 75,
    "codeQuality": 70,
    "recommendations": ["Add error handling", "Improve validation"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "implementation": {
    "id": "error-handling",
    "title": "Implement Comprehensive Error Handling",
    "status": "completed"
  },
  "codeGeneration": {
    "success": true,
    "branchName": "ai-implementation-error-handling-1234567890",
    "modifiedFiles": ["src/utils/errorHandler.js", "src/middleware/errorMiddleware.js"],
    "commitHash": "abc123def456",
    "validationResults": {
      "linting": "passed",
      "tests": "passed"
    }
  },
  "pullRequest": {
    "success": true,
    "url": "https://github.com/username/repository/pull/123",
    "branchName": "ai-implementation-error-handling-1234567890"
  },
  "metadata": {
    "projectName": "My Project",
    "branchName": "ai-implementation-error-handling-1234567890",
    "generatedAt": "2025-01-27T10:30:00Z"
  }
}
```

### 2. Batch Implementation

**POST** `/api/implementation/batch`

Generate multiple implementations in sequence.

```json
{
  "repoUrl": "https://github.com/username/repository",
  "projectName": "My Project",
  "techStack": ["React", "Node.js"],
  "implementations": [
    {
      "id": "error-handling",
      "title": "Implement Error Handling",
      "description": "Add comprehensive error handling",
      "category": "Quality",
      "priority": "High"
    },
    {
      "id": "input-validation",
      "title": "Add Input Validation",
      "description": "Implement client and server-side validation",
      "category": "Security",
      "priority": "High"
    }
  ],
  "createSeparatePRs": true
}
```

### 3. Generate Implementation Plan

**POST** `/api/implementation/plan`

Generate a detailed implementation plan without executing.

```json
{
  "repoUrl": "https://github.com/username/repository",
  "projectName": "My Project",
  "techStack": ["React", "Node.js"],
  "implementations": [
    {
      "id": "testing",
      "title": "Add Testing Framework",
      "category": "Testing",
      "priority": "Medium",
      "difficulty": "Intermediate"
    }
  ]
}
```

### 4. Get Implementation Status

**GET** `/api/implementation/status?repoUrl=https://github.com/username/repository`

Get implementation history and status for a repository.

## Usage Examples

### Frontend Integration

Update your `CodeImplementations.tsx` component to call the new endpoints:

```typescript
// In your handleImplementationStart function
const handleImplementationStart = async (implementationIds: string[]) => {
  try {
    const response = await fetch(`${apiBase}/api/implementation/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: project.projectLink,
        projectName: project.projectName,
        techStack: project.techStack,
        implementation: getImplementationById(implementationIds[0]),
        analysisData: aiAnalysis
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Implementation successful! PR created: ${result.pullRequest.url}`);
    } else {
      alert(`Implementation failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Implementation failed:', error);
  }
};

// For batch implementation
const handleBatchImplementation = async (implementationIds: string[]) => {
  const implementations = implementationIds.map(getImplementationById);
  
  const response = await fetch(`${apiBase}/api/implementation/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repoUrl: project.projectLink,
      projectName: project.projectName,
      techStack: project.techStack,
      implementations,
      analysisData: aiAnalysis
    })
  });
  
  const result = await response.json();
  // Handle batch results...
};
```

## Workflow

### Automated Code Implementation Flow

1. **AI Analysis**: Run AI analysis on the repository to get recommendations
2. **Plan Generation**: Generate implementation plan to review changes
3. **Code Generation**: Execute Gemini CLI to implement changes
4. **Validation**: Run linting and tests on generated code
5. **PR Creation**: Create pull request with implemented changes
6. **Review**: Manual review and merge of generated code

### Example Complete Workflow

```bash
# 1. Setup project for Gemini
node backend/scripts/setupGemini.js /path/to/project

# 2. Run AI analysis (via existing API)
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/user/repo", "projectName": "My Project"}'

# 3. Generate implementation plan
curl -X POST http://localhost:3000/api/implementation/plan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/user/repo", "projectName": "My Project", "implementations": [...]}'

# 4. Execute implementation
curl -X POST http://localhost:3000/api/implementation/generate \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/user/repo", "implementation": {...}}'

# 5. Check status
curl "http://localhost:3000/api/implementation/status?repoUrl=https://github.com/user/repo"
```

## Troubleshooting

### Common Issues

1. **Gemini CLI not found**
   - Check GEMINI_CLI_PATH environment variable
   - Ensure Gemini CLI is installed and in PATH

2. **Repository clone fails**
   - Check repository URL and access permissions
   - Ensure Git is installed and configured

3. **PR creation fails**
   - Verify GitHub token has necessary permissions
   - Check if GitHub CLI is installed and authenticated

4. **Validation fails**
   - Ensure project has linting and testing configured
   - Check that dependencies are installed

### Logs and Debugging

- Implementation logs are stored in the console output
- Redis stores implementation history and status
- Each implementation creates a unique branch for isolation

## Security Considerations

1. **Repository Access**: Only clone trusted repositories
2. **API Keys**: Keep Gemini API keys secure
3. **GitHub Tokens**: Use tokens with minimal required permissions
4. **Workspace Isolation**: Implementations run in isolated workspaces
5. **Code Review**: Always review generated code before merging

## Performance Tips

1. **Batch Size**: Limit batch implementations to 5 items at a time
2. **Workspace Cleanup**: Automatic cleanup after implementation
3. **Caching**: Redis caches implementation history
4. **Timeouts**: Implementations have 5-minute timeout limit
