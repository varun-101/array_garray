import GitHubService from "../services/githubService.js";

// Get user's repositories
export const getUserRepos = async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const repos = await githubService.getUserRepos();
    
    res.json({
      success: true,
      data: repos,
      count: repos.length
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ 
      error: "Failed to fetch repositories",
      details: error.message 
    });
  }
};

// Get a specific repository
export const getRepo = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const repository = await githubService.getRepo(owner, repo);
    
    res.json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error("Error fetching repository:", error);
    res.status(500).json({ 
      error: "Failed to fetch repository",
      details: error.message 
    });
  }
};

// Get repository branches
export const getRepoBranches = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const branches = await githubService.getBranches(owner, repo);
    
    res.json({
      success: true,
      data: branches,
      count: branches.length
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ 
      error: "Failed to fetch branches",
      details: error.message 
    });
  }
};

// Get repository commits
export const getRepoCommits = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    const { sha, per_page } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const commits = await githubService.getCommits(owner, repo, { 
      sha: sha || "main", 
      per_page: per_page || 30 
    });
    
    res.json({
      success: true,
      data: commits,
      count: commits.length
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    res.status(500).json({ 
      error: "Failed to fetch commits",
      details: error.message 
    });
  }
};

// Check repository access
export const checkRepoAccess = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const { owner, repo } = req.params;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const hasAccess = await githubService.checkRepoAccess(owner, repo);
    
    res.json({
      success: true,
      hasAccess,
      repository: `${owner}/${repo}`
    });
  } catch (error) {
    console.error("Error checking repository access:", error);
    res.status(500).json({ 
      error: "Failed to check repository access",
      details: error.message 
    });
  }
};
