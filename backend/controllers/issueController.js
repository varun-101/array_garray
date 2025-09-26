import GitHubService from "../services/githubService.js";
import DatabaseService from "../services/databaseService.js";

// Create an issue
export const createIssue = async (req, res) => {
  try {
    const { accessToken, title, body, labels, assignees } = req.body;
    const { owner, repo } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    if (!title) {
      return res.status(400).json({ error: "Issue title is required" });
    }

    const githubService = new GitHubService(accessToken);
    const issue = await githubService.createIssue(owner, repo, {
      title,
      body: body || "",
      labels: labels || [],
      assignees: assignees || []
    });

    // Save issue to database for tracking
    await DatabaseService.createOrUpdateIssue(issue, {
      owner,
      name: repo,
      fullName: `${owner}/${repo}`
    }, true);
    
    res.status(201).json({
      success: true,
      data: issue,
      message: "Issue created successfully"
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ 
      error: "Failed to create issue",
      details: error.message 
    });
  }
};

// Get issues for a repository
export const getIssues = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    const { state, sort, direction, per_page } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const issues = await githubService.getIssues(owner, repo, {
      state: state || "open",
      sort: sort || "created",
      direction: direction || "desc",
      per_page: per_page || 30
    });
    
    res.json({
      success: true,
      data: issues,
      count: issues.length
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ 
      error: "Failed to fetch issues",
      details: error.message 
    });
  }
};

// Get a specific issue
export const getIssue = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo, issue_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const issue = await githubService.getIssue(owner, repo, issue_number);
    
    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ 
      error: "Failed to fetch issue",
      details: error.message 
    });
  }
};

// Update an issue
export const updateIssue = async (req, res) => {
  try {
    const { accessToken, title, body, state, labels, assignees } = req.body;
    const { owner, repo, issue_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const issue = await githubService.updateIssue(owner, repo, issue_number, {
      title,
      body,
      state,
      labels,
      assignees
    });
    
    res.json({
      success: true,
      data: issue,
      message: "Issue updated successfully"
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ 
      error: "Failed to update issue",
      details: error.message 
    });
  }
};

// Close an issue
export const closeIssue = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo, issue_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const issue = await githubService.updateIssue(owner, repo, issue_number, {
      state: "closed"
    });
    
    res.json({
      success: true,
      data: issue,
      message: "Issue closed successfully"
    });
  } catch (error) {
    console.error("Error closing issue:", error);
    res.status(500).json({ 
      error: "Failed to close issue",
      details: error.message 
    });
  }
};
