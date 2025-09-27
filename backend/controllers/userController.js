import DatabaseService from "../services/databaseService.js";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { githubId } = req.params;
    
    const user = await DatabaseService.findUserByGitHubId(parseInt(githubId));
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        githubId: user.githubId,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUrl: user.githubUrl,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        joined: user.joined,
        title: user.title,
        lastLoginAt: user.lastLoginAt,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      error: "Failed to fetch user profile",
      details: error.message 
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { githubId } = req.params;
    const profileData = req.body;
    
    const user = await DatabaseService.findUserByGitHubId(parseInt(githubId));
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    // Update profile using the model method
    await user.updateProfile(profileData);
    
    res.json({
      success: true,
      data: {
        id: user._id,
        githubId: user.githubId,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        githubUrl: user.githubUrl,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        joined: user.joined,
        title: user.title,
        lastLoginAt: user.lastLoginAt,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ 
      error: "Failed to update user profile",
      details: error.message 
    });
  }
};

// Get user repositories from database
export const getUserRepos = async (req, res) => {
  try {
    const { githubId } = req.params;
    
    const user = await DatabaseService.findUserByGitHubId(parseInt(githubId));
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    res.json({
      success: true,
      data: user.repositories,
      count: user.repositories.length
    });
  } catch (error) {
    console.error("Error fetching user repositories:", error);
    res.status(500).json({ 
      error: "Failed to fetch user repositories",
      details: error.message 
    });
  }
};

// Update user repositories
export const updateUserRepos = async (req, res) => {
  try {
    const { githubId } = req.params;
    const { repositories } = req.body;
    
    if (!repositories || !Array.isArray(repositories)) {
      return res.status(400).json({ 
        error: "Repositories array is required" 
      });
    }

    const user = await DatabaseService.updateUserRepositories(parseInt(githubId), repositories);
    
    res.json({
      success: true,
      data: user.repositories,
      count: user.repositories.length,
      message: "Repositories updated successfully"
    });
  } catch (error) {
    console.error("Error updating user repositories:", error);
    res.status(500).json({ 
      error: "Failed to update user repositories",
      details: error.message 
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { githubId } = req.params;
    
    const stats = await DatabaseService.getUserStats(parseInt(githubId));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch user stats",
      details: error.message 
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { githubId } = req.params;
    const { preferences } = req.body;
    
    const user = await DatabaseService.findUserByGitHubId(parseInt(githubId));
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.json({
      success: true,
      data: user.preferences,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ 
      error: "Failed to update user preferences",
      details: error.message 
    });
  }
};

// Get user issues
export const getUserIssues = async (req, res) => {
  try {
    const { githubId } = req.params;
    const { state, limit = 50 } = req.query;
    
    let issues = await DatabaseService.findIssuesByAuthor(parseInt(githubId));
    
    if (state) {
      issues = issues.filter(issue => issue.state === state);
    }
    
    if (limit) {
      issues = issues.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: issues,
      count: issues.length
    });
  } catch (error) {
    console.error("Error fetching user issues:", error);
    res.status(500).json({ 
      error: "Failed to fetch user issues",
      details: error.message 
    });
  }
};

// Get user pull requests
export const getUserPullRequests = async (req, res) => {
  try {
    const { githubId } = req.params;
    const { state, limit = 50 } = req.query;
    
    let pullRequests = await DatabaseService.findPullRequestsByAuthor(parseInt(githubId));
    
    if (state) {
      pullRequests = pullRequests.filter(pr => pr.state === state);
    }
    
    if (limit) {
      pullRequests = pullRequests.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: pullRequests,
      count: pullRequests.length
    });
  } catch (error) {
    console.error("Error fetching user pull requests:", error);
    res.status(500).json({ 
      error: "Failed to fetch user pull requests",
      details: error.message 
    });
  }
};
