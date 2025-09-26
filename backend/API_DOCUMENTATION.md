# GitHub API Integration - Backend Documentation

## Overview
This backend now supports full GitHub integration with the ability to:
- Authenticate users via GitHub OAuth
- Access user repositories
- Create and manage issues
- Create and manage pull requests

## Authentication

### GitHub OAuth Flow
1. **Initiate OAuth**: `GET /auth/github`
   - Redirects user to GitHub for authentication
   - Now includes `repo` scope for repository access

2. **OAuth Callback**: `GET /auth/github/callback`
   - Handles GitHub OAuth callback
   - Returns user data and access token

**Response:**
```json
{
  "user": {
    "id": 12345,
    "login": "username",
    "name": "User Name",
    "email": "user@example.com"
  },
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "message": "Successfully authenticated with GitHub"
}
```

## Repository Endpoints

All repository endpoints require the `accessToken` in the request body.

### Get User Repositories
**POST** `/github/repos`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Get Specific Repository
**POST** `/github/repos/:owner/:repo`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Get Repository Branches
**POST** `/github/repos/:owner/:repo/branches`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Get Repository Commits
**POST** `/github/repos/:owner/:repo/commits?sha=main&per_page=30`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Check Repository Access
**POST** `/github/repos/:owner/:repo/access`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

## Issue Endpoints

### Create Issue
**POST** `/github/repos/:owner/:repo/issues`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "title": "Issue Title",
  "body": "Issue description",
  "labels": ["bug", "enhancement"],
  "assignees": ["username"]
}
```

### Get Issues
**POST** `/github/repos/:owner/:repo/issues/list?state=open&sort=created&direction=desc&per_page=30`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Get Specific Issue
**POST** `/github/repos/:owner/:repo/issues/:issue_number`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Update Issue
**PATCH** `/github/repos/:owner/:repo/issues/:issue_number`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "title": "Updated Title",
  "body": "Updated description",
  "state": "open",
  "labels": ["bug"],
  "assignees": ["username"]
}
```

### Close Issue
**PATCH** `/github/repos/:owner/:repo/issues/:issue_number/close`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

## Pull Request Endpoints

### Create Pull Request
**POST** `/github/repos/:owner/:repo/pulls`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "title": "PR Title",
  "body": "PR description",
  "head": "feature-branch",
  "base": "main",
  "draft": false
}
```

### Get Pull Requests
**POST** `/github/repos/:owner/:repo/pulls/list?state=open&sort=created&direction=desc&per_page=30`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

## AI Analysis Endpoints

### Generate AI Analysis
**POST** `/api/ai/analyze/:projectId?`
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "projectName": "My Awesome Project",
  "techStack": ["React", "Node.js", "TypeScript"],
  "difficulty": "intermediate",
  "category": "Web Development"
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "optional-project-id",
  "projectName": "My Awesome Project",
  "repoUrl": "https://github.com/owner/repo",
  "techStack": ["React", "Node.js", "TypeScript"],
  "difficulty": "intermediate",
  "category": "Web Development",
  "analysis": {
    "overallScore": 85,
    "codeQuality": 78,
    "maintainability": 82,
    "security": 90,
    "performance": 75,
    "documentation": 88,
    "recommendations": [
      "Consider adding more comprehensive error handling",
      "Implement automated testing to improve code coverage"
    ],
    "strengths": [
      "Well-structured codebase with clear separation of concerns",
      "Good use of modern technologies and best practices"
    ],
    "improvements": [
      "Increase test coverage to above 80%",
      "Add performance monitoring and optimization"
    ],
    "techStackAnalysis": {
      "modern": ["React", "TypeScript", "Node.js"],
      "stable": ["JavaScript", "HTML", "CSS"],
      "emerging": ["Next.js", "Tailwind CSS"]
    }
  },
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

### Get AI Service Status
**GET** `/api/ai/status`

**Response:**
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

### Get Cached Analysis (Future Feature)
**GET** `/api/ai/analysis/:projectId`
```json
{
  "message": "Analysis retrieval not implemented yet",
  "note": "Use POST /api/ai/analyze/:projectId to generate new analysis",
  "projectId": "project-id"
}
```

### Get Specific Pull Request
**POST** `/github/repos/:owner/:repo/pulls/:pr_number`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

### Update Pull Request
**PATCH** `/github/repos/:owner/:repo/pulls/:pr_number`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "title": "Updated PR Title",
  "body": "Updated PR description",
  "state": "open",
  "base": "main"
}
```

### Merge Pull Request
**PUT** `/github/repos/:owner/:repo/pulls/:pr_number/merge`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx",
  "commit_title": "Merge PR Title",
  "commit_message": "Merge PR description",
  "merge_method": "merge"
}
```

### Close Pull Request
**PATCH** `/github/repos/:owner/:repo/pulls/:pr_number/close`
```json
{
  "accessToken": "gho_xxxxxxxxxxxxxxxxxxxx"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (for new resources)
- `400`: Bad Request (missing required fields)
- `401`: Unauthorized (invalid access token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (repository/issue/PR not found)
- `500`: Internal Server Error

## GitHub Permissions Required

The OAuth flow now requests the following scopes:
- `user`: Access to user profile information
- `repo`: Full access to repositories (read, write, create issues, create PRs)

## Usage Examples

### Frontend Integration Example

```javascript
// After GitHub OAuth callback
const { accessToken } = authResponse;

// Get user repositories
const repos = await fetch('/github/repos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ accessToken })
});

// Create an issue
const newIssue = await fetch('/github/repos/owner/repo/issues', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessToken,
    title: 'New Bug Report',
    body: 'Description of the bug',
    labels: ['bug']
  })
});

// Create a pull request
const newPR = await fetch('/github/repos/owner/repo/pulls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessToken,
    title: 'Feature Implementation',
    body: 'Description of changes',
    head: 'feature-branch',
    base: 'main'
  })
});
```

## Security Notes

1. **Access Token Storage**: Access tokens should be stored securely on the client side
2. **Token Expiration**: GitHub access tokens can expire; implement refresh logic if needed
3. **Scope Validation**: Ensure users have the necessary permissions before making API calls
4. **Rate Limiting**: GitHub API has rate limits; implement appropriate handling

## Environment Variables Required

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
