import GitHubService from "../services/githubService.js";
import DatabaseService from "../services/databaseService.js";

// Create a pull request
export const createPullRequest = async (req, res) => {
  try {
    const { accessToken, title, body, head, base, draft } = req.body;
    const { owner, repo } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    if (!title || !head || !base) {
      return res.status(400).json({ 
        error: "Title, head branch, and base branch are required" 
      });
    }

    const githubService = new GitHubService(accessToken);
    const pullRequest = await githubService.createPullRequest(owner, repo, {
      title,
      body: body || "",
      head,
      base,
      draft: draft || false
    });

    // Save pull request to database for tracking
    await DatabaseService.createOrUpdatePullRequest(pullRequest, {
      owner,
      name: repo,
      fullName: `${owner}/${repo}`
    }, true);
    
    res.status(201).json({
      success: true,
      data: pullRequest,
      message: "Pull request created successfully"
    });
  } catch (error) {
    console.error("Error creating pull request:", error);
    res.status(500).json({ 
      error: "Failed to create pull request",
      details: error.message 
    });
  }
};

// Get pull requests for a repository
export const getPullRequests = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    const { state, sort, direction, per_page } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const pullRequests = await githubService.getPullRequests(owner, repo, {
      state: state || "open",
      sort: sort || "created",
      direction: direction || "desc",
      per_page: per_page || 30
    });
    
    res.json({
      success: true,
      data: pullRequests,
      count: pullRequests.length
    });
  } catch (error) {
    console.error("Error fetching pull requests:", error);
    res.status(500).json({ 
      error: "Failed to fetch pull requests",
      details: error.message 
    });
  }
};

// Get a specific pull request
export const getPullRequest = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo, pr_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const pullRequest = await githubService.getPullRequest(owner, repo, pr_number);
    
    res.json({
      success: true,
      data: pullRequest
    });
  } catch (error) {
    console.error("Error fetching pull request:", error);
    res.status(500).json({ 
      error: "Failed to fetch pull request",
      details: error.message 
    });
  }
};

// Update a pull request
export const updatePullRequest = async (req, res) => {
  try {
    const { accessToken, title, body, state, base } = req.body;
    const { owner, repo, pr_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const pullRequest = await githubService.updatePullRequest(owner, repo, pr_number, {
      title,
      body,
      state,
      base
    });
    
    res.json({
      success: true,
      data: pullRequest,
      message: "Pull request updated successfully"
    });
  } catch (error) {
    console.error("Error updating pull request:", error);
    res.status(500).json({ 
      error: "Failed to update pull request",
      details: error.message 
    });
  }
};

// Merge a pull request
export const mergePullRequest = async (req, res) => {
  try {
    const { accessToken, commit_title, commit_message, merge_method } = req.body;
    const { owner, repo, pr_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const result = await githubService.mergePullRequest(owner, repo, pr_number, {
      commit_title,
      commit_message,
      merge_method: merge_method || "merge"
    });
    
    res.json({
      success: true,
      data: result,
      message: "Pull request merged successfully"
    });
  } catch (error) {
    console.error("Error merging pull request:", error);
    res.status(500).json({ 
      error: "Failed to merge pull request",
      details: error.message 
    });
  }
};

// Close a pull request
export const closePullRequest = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo, pr_number } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const pullRequest = await githubService.updatePullRequest(owner, repo, pr_number, {
      state: "closed"
    });
    
    res.json({
      success: true,
      data: pullRequest,
      message: "Pull request closed successfully"
    });
  } catch (error) {
    console.error("Error closing pull request:", error);
    res.status(500).json({ 
      error: "Failed to close pull request",
      details: error.message 
    });
  }
};
