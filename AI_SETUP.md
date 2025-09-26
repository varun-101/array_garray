# AI Code Analysis Setup Guide

This guide will help you set up the AI-powered code analysis feature that downloads repository code and generates comprehensive analysis using OpenRouter (supporting multiple AI models including Claude, GPT-4, Llama, and more).

## Overview

The AI analysis feature provides:
- **Code Quality Assessment** - Analyzes code structure, patterns, and best practices
- **Security Analysis** - Identifies potential security vulnerabilities
- **Performance Evaluation** - Suggests performance optimizations
- **Architecture Review** - Reviews overall project architecture
- **Tech Stack Analysis** - Categorizes technologies as modern, stable, or emerging
- **Actionable Recommendations** - Provides specific improvement suggestions

## Prerequisites

1. **OpenRouter API Key** - You need an OpenRouter account for AI model access
2. **Git** - Must be installed on the server for repository cloning
3. **Network Access** - Server needs to clone public GitHub repositories

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to the API Keys section in your dashboard
4. Create a new API key
5. Copy the key (starts with `sk-`)

**Benefits of OpenRouter:**
- Access to multiple AI models (Claude, GPT-4, Llama, Gemini, etc.)
- Often more cost-effective than direct provider APIs
- Unified interface for different models
- Better rate limits and reliability

### 2. Configure Environment Variables

Add the following to your backend `.env` file:

```env
# OpenRouter Configuration (REQUIRED for AI analysis)
OPENROUTER_API_KEY=sk-your_openrouter_api_key_here

# Optional: Choose your preferred AI model (defaults to Claude 3.5 Sonnet)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Optional: App name for OpenRouter analytics
OPENROUTER_APP_NAME=Codeissance-Hackathon-App
```

**Available Models:**
- `openai/gpt-3.5-turbo` (Default - Fast and cost-effective)
- `anthropic/claude-3.5-sonnet` (Best quality for code analysis, more expensive)
- `openai/gpt-4-turbo` (High quality, expensive)
- `meta-llama/llama-3.1-70b-instruct` (Open source, very affordable)
- `google/gemini-pro` (Google's model)
- And many more on [OpenRouter Models](https://openrouter.ai/models)

**Recommended for limited budgets:**
- `openai/gpt-3.5-turbo` - Best balance of cost and quality
- `meta-llama/llama-3.1-70b-instruct` - Very cheap or free
- `anthropic/claude-3-haiku` - Fast and affordable

### 3. Verify Git Installation

Ensure Git is installed on your server:

```bash
git --version
```

If not installed:

```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git

# macOS
xcode-select --install
```

### 4. Start the Backend

```bash
cd backend
npm start
```

### 5. Test AI Service

Check if the AI service is properly configured:

```bash
curl http://localhost:3000/api/ai/status
```

Expected response when properly configured:
```json
{
  "status": "available",
  "hasApiKey": true,
  "provider": "OpenRouter",
  "model": "anthropic/claude-3.5-sonnet",
  "message": "AI analysis service is ready with OpenRouter",
  "version": "1.0",
  "supportedFeatures": [
    "Repository code analysis",
    "Code quality assessment",
    "Security analysis",
    "Performance evaluation",
    "Architecture review",
    "Tech stack analysis"
  ],
  "availableModels": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4-turbo",
    "openai/gpt-3.5-turbo",
    "meta-llama/llama-3.1-70b-instruct",
    "google/gemini-pro"
  ]
}
```

## Usage

### Frontend Integration

The AI analysis is automatically available in the project details page:

1. Navigate to any project details page
2. Click on the "AI Summary" tab
3. The analysis will automatically start if a repository URL is available
4. You can refresh the analysis anytime using the "Refresh Analysis" button

### API Usage

You can also call the AI analysis API directly:

```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/owner/repo",
    "projectName": "My Project",
    "techStack": ["React", "Node.js"],
    "difficulty": "intermediate",
    "category": "Web Development"
  }'
```

## Features

### Automatic Analysis
- Repository code is automatically downloaded and analyzed
- Supports public GitHub repositories
- Analyzes up to 50 files and 100KB total code content
- Includes project structure analysis

### Comprehensive Scoring
- **Overall Score** (0-100) - General project quality
- **Code Quality** (0-100) - Code structure and patterns
- **Maintainability** (0-100) - How easy the code is to maintain
- **Security** (0-100) - Security practices and vulnerabilities
- **Performance** (0-100) - Performance optimization level
- **Documentation** (0-100) - Documentation quality

### Detailed Insights
- **5 Specific Recommendations** - Actionable improvement suggestions
- **5 Project Strengths** - What the project does well
- **5 Areas for Improvement** - Specific areas to focus on
- **Tech Stack Categorization** - Modern, stable, and emerging technologies

### Fallback System
- If OpenAI API is unavailable, provides intelligent fallback analysis
- Analysis based on project metadata and tech stack
- Ensures users always get useful insights

## Troubleshooting

### "OpenRouter API key not configured"
- Ensure `OPENROUTER_API_KEY` is set in your `.env` file
- Restart the backend server after adding the environment variable
- Verify your API key is valid on the OpenRouter dashboard

### "Insufficient AI service credits"
- You don't have enough credits in your OpenRouter account
- Visit [OpenRouter Credits](https://openrouter.ai/settings/credits) to add funds
- Consider switching to a cheaper model like `openai/gpt-3.5-turbo` or `meta-llama/llama-3.1-70b-instruct`
- Free tier users should use Llama models which are often free

### "Unable to access repository"
- Verify the repository URL is correct and publicly accessible
- Check that the server has internet access
- Ensure Git is properly installed

### "AI service rate limit exceeded"
- You've hit OpenRouter's rate limits
- Wait a few minutes before trying again
- OpenRouter typically has higher limits than direct provider APIs
- Check your usage on the OpenRouter dashboard

### Model-specific Issues
- If a specific model is not working, try switching to another model
- Some models may have temporary availability issues
- Claude 3.5 Sonnet is generally the most reliable for code analysis

### Analysis Takes Too Long
- Large repositories may take 30-60 seconds to analyze
- The system automatically limits analysis to 50 files maximum
- Consider analyzing smaller repositories for faster results

## Cost Considerations

- Each analysis uses approximately 800-1,500 tokens (optimized for cost)
- OpenRouter pricing varies by model:
  - GPT-3.5 Turbo: ~$0.002-0.004 per analysis (Default)
  - Claude 3.5 Sonnet: ~$0.015-0.075 per analysis
  - GPT-4 Turbo: ~$0.01-0.06 per analysis  
  - Llama models: Often free or ~$0.001 per analysis
  - Claude Haiku: ~$0.001-0.005 per analysis
- Monitor your OpenRouter dashboard for cost tracking
- OpenRouter often provides better pricing than direct provider APIs
- **Tip**: Start with GPT-3.5 Turbo or Llama models for testing
- Free tier users can often use Llama models without charges

## Security Notes

- Repository code is temporarily downloaded to `/tmp/repo_analysis`
- All temporary files are automatically cleaned up after analysis
- No code is stored permanently on the server
- Only repository content is sent to OpenAI for analysis

## Advanced Configuration

### Customizing Analysis Scope

You can modify the analysis in `backend/services/aiAnalysisService.js`:

- Change `maxFiles` to analyze more/fewer files
- Modify `codeExtensions` to include additional file types
- Update `ignorePatterns` to skip specific directories

### Custom AI Prompts

The AI prompt can be customized in the `buildAnalysisPrompt` method to focus on specific aspects of code analysis.

## Support

If you encounter issues:

1. Check the backend console logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test the `/api/ai/status` endpoint to confirm configuration
4. Ensure your OpenAI account has sufficient credits

For additional help, check the API documentation in `backend/API_DOCUMENTATION.md`.
