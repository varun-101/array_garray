import GitHubService from "../services/githubService.js";
import Repository from "../models/Repository.js";

// Get user's repositories
export const getUserRepos = async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    const githubService = new GitHubService(accessToken);
    const ghRepos = await githubService.getUserRepos();

    // Map to simplified shape expected by frontend and upsert into MongoDB
    const simplified = ghRepos.map(r => ({
      githubId: r.id,
      ownerLogin: r.owner?.login,
      ownerAvatarUrl: r.owner?.avatar_url,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      private: r.private,
      url: r.html_url,
      cloneUrl: r.clone_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      lastUpdated: r.updated_at,
      visibility: r.visibility,
    }));

    // Upsert repositories concurrently
    await Promise.all(
      simplified.map(async (repo) => {
        await Repository.updateOne(
          { githubId: repo.githubId },
          { $set: repo },
          { upsert: true }
        );
      })
    );

    // Return the minimal set needed by MyProjects
    res.json({
      success: true,
      data: simplified.map(r => ({
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        private: r.private,
        url: r.url,
        cloneUrl: r.cloneUrl,
        language: r.language,
        stars: r.stars,
        forks: r.forks,
        lastUpdated: r.lastUpdated,
      })),
      count: simplified.length
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
