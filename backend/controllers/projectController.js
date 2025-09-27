import DatabaseService from "../services/databaseService.js";
import Projects from "../models/Projects.js";
import Repository from "../models/Repository.js";
import User from "../models/User.js";
import GitHubService from "../services/githubService.js";

export const uploadProject = async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      projectLink,
      techStack,
      projectImgUrl,
      projectImgUrls,
      projectVideoUrls,
      demoUrl,
      category,
      difficulty,
      estimatedTime,
      tags,
      accessToken,
    } = req.body;

    if (!projectName || !projectDescription || !projectLink || !accessToken) {
      return res.status(400).json({
        error: "projectName, projectDescription, projectLink, accessToken are required",
      });
    }

    const linkMatch = typeof projectLink === "string"
      ? projectLink.match(/^https?:\/\/github\.com\/([^\/\?\#]+)/i)
      : null;
    if (!linkMatch) {
      return res.status(400).json({ error: "projectLink must be a valid GitHub URL" });
    }

    const username = linkMatch[1];

    const user = await DatabaseService.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "User not found for provided projectLink" });
    }

    const normalizedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === "string" && techStack.trim().length > 0
        ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const project = await Projects.create({
      user: user._id,
      projectName,
      projectDescription,
      projectLink,
      techStack: normalizedTechStack,
      projectImgUrl: projectImgUrl || null,
      projectImgUrls: Array.isArray(projectImgUrls) ? projectImgUrls : (projectImgUrl ? [projectImgUrl] : []),
      projectVideoUrls: Array.isArray(projectVideoUrls) ? projectVideoUrls : [],
      demoUrl: demoUrl || null,
      category: category || '',
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || '',
      tags: Array.isArray(tags) ? tags : [],
      accessToken,
    });

    return res.status(201).json(project);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getProjects = async (_req, res) => {
  try {
    const projects = await Projects.find()
      .sort({ createdAt: -1 })
      .populate("user", "name avatar username")
      .populate("collaborators.user", "name avatar username");

    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Projects.findById(id)
    .populate("user", "name avatar username")
    .populate("collaborators.user", "name avatar username")
    .populate("feedback.mentor", "name organization role profilePhotoUrl");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // console.log(project)
    // Find the repository by matching the project's projectLink with the Repository's url field
    // (Assuming you have imported the Repository model at the top of this file)
    // Example: import Repository from "../models/Repository.js";
    const repo = await Repository.findOne({ url: project.projectLink });

    // Return the project as a plain object, and add repoId (or null if not found)
    const projectObj = project.toObject();
    projectObj.repoId = repo ? repo.githubId : null;

    return res.status(200).json(projectObj);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId, feedbackText, rating } = req.body;

    if (!id || !mentorId || !feedbackText) {
      return res.status(400).json({ 
        error: "Project ID, mentor ID, and feedback text are required" 
      });
    }

    const project = await Projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if mentor has already given feedback
    const existingFeedback = project.feedback.find(f => f.mentor.toString() === mentorId);
    if (existingFeedback) {
      return res.status(400).json({ error: "You have already provided feedback for this project" });
    }

    // Add feedback to project
    project.feedback.push({
      mentor: mentorId,
      feedbackText,
      rating: rating || null
    });

    await project.save();

    // Return updated project with populated feedback
    const updatedProject = await Projects.findById(id)
      .populate("user", "name avatar username")
      .populate("feedback.mentor", "name organization role profilePhotoUrl");

    return res.status(200).json(updatedProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDeployedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { deployedUrl } = req.body;

    if (!id || !deployedUrl) {
      return res.status(400).json({ 
        error: "Project ID and deployed URL are required" 
      });
    }

    const project = await Projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update the deployed URL
    project.deployedUrl = deployedUrl;
    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Projects.findById(id)
      .populate("user", "name avatar username")
      .populate("feedback.mentor", "name organization role profilePhotoUrl");

    return res.status(200).json(updatedProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Adopt project - add user as collaborator
export const adoptProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || !userId) {
      return res.status(400).json({ 
        error: "Project ID and User ID are required" 
      });
    }

    const project = await Projects.findById(id)
      .populate("user", "name avatar username githubId accessToken");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get the user who wants to adopt the project
    const adoptingUser = await User.findById(userId);
    if (!adoptingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ 
        error: "User is already a collaborator on this project" 
      });
    }

    // Check if user is the project owner
    if (project.user._id.toString() === userId) {
      return res.status(400).json({ 
        error: "Project owner cannot adopt their own project" 
      });
    }

    // Parse repository URL to get owner and repo name
    const { owner, repo } = GitHubService.parseRepoUrl(project.projectLink);

    // Initialize GitHub service with project owner's access token
    const githubService = new GitHubService(project.accessToken);

    let githubCollaborationResult = null;
    let collaborationStatus = 'pending';

    try {
      // Try to add collaborator to GitHub repository
      githubCollaborationResult = await githubService.addCollaborator(
        owner, 
        repo, 
        adoptingUser.username, 
        'push' // Default permission level
      );
      
      // If GitHub API call succeeds, mark as pending (user needs to accept invitation)
      collaborationStatus = 'pending';
      
    } catch (githubError) {
      console.error('GitHub collaboration error:', githubError.message);
      console.error('GitHub error details:', {
        owner,
        repo,
        username: adoptingUser.username,
        error: githubError.message
      });
      
      // If GitHub API fails, still add to our database but mark with error status
      // This allows us to track the request even if GitHub API fails
      collaborationStatus = 'github_error';
    }

    // Add user as collaborator in our database
    project.collaborators.push({
      user: userId,
      status: collaborationStatus,
      invitedAt: new Date(),
      githubResult: githubCollaborationResult
    });

    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Projects.findById(id)
      .populate("user", "name avatar username")
      .populate("collaborators.user", "name avatar username")
      .populate("feedback.mentor", "name organization role profilePhotoUrl");

    return res.status(200).json({
      project: updatedProject,
      githubResult: githubCollaborationResult,
      message: collaborationStatus === 'pending' 
        ? 'Collaboration invitation sent successfully' 
        : 'Collaboration request recorded (GitHub API error occurred)'
    });
  } catch (err) {
    console.error('Adopt project error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Respond to collaboration invitation
export const respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, status } = req.body;

    if (!id || !userId || !status) {
      return res.status(400).json({ 
        error: "Project ID, User ID, and status are required" 
      });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        error: "Status must be either 'accepted' or 'declined'" 
      });
    }

    const project = await Projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Find the collaboration invitation
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === userId && collab.status === 'pending'
    );

    if (!collaborator) {
      return res.status(404).json({ 
        error: "No pending invitation found for this user" 
      });
    }

    // Update the collaboration status
    collaborator.status = status;
    collaborator.respondedAt = new Date();

    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Projects.findById(id)
      .populate("user", "name avatar username")
      .populate("collaborators.user", "name avatar username")
      .populate("feedback.mentor", "name organization role profilePhotoUrl");

    return res.status(200).json(updatedProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get user's collaboration status for a project
export const getCollaborationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({ 
        error: "Project ID and User ID are required" 
      });
    }

    const project = await Projects.findById(id)
      .populate("collaborators.user", "name avatar username githubId")
      .populate("user", "name avatar username githubId accessToken");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find user's collaboration status in our database
    const collaboration = project.collaborators.find(
      collab => collab.user._id.toString() === userId
    );

    let githubStatus = null;
    
    // If user is not the owner, check GitHub collaboration status
    if (project.user._id.toString() !== userId) {
      try {
        const { owner, repo } = GitHubService.parseRepoUrl(project.projectLink);
        const githubService = new GitHubService(project.user.accessToken);
        githubStatus = await githubService.checkCollaborator(owner, repo, user.username);
      } catch (githubError) {
        console.error('GitHub status check error:', githubError.message);
        githubStatus = { error: githubError.message };
      }
    }

    const response = {
      isOwner: project.user._id.toString() === userId,
      collaboration: collaboration ? {
        status: collaboration.status,
        invitedAt: collaboration.invitedAt,
        respondedAt: collaboration.respondedAt,
        githubResult: collaboration.githubResult
      } : null,
      githubStatus: githubStatus
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Get collaboration status error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Sync GitHub collaboration status with our database
export const syncGitHubCollaborationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({ 
        error: "Project ID and User ID are required" 
      });
    }

    const project = await Projects.findById(id)
      .populate("user", "name avatar username githubId accessToken");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse repository URL
    const { owner, repo } = GitHubService.parseRepoUrl(project.projectLink);
    const githubService = new GitHubService(project.user.accessToken);

    // Check GitHub collaboration status
    const githubStatus = await githubService.checkCollaborator(owner, repo, user.username);

    // Find existing collaboration in our database
    const existingCollaboration = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    let updatedStatus = null;

    if (githubStatus.isCollaborator) {
      // User is a collaborator on GitHub
      if (existingCollaboration) {
        // Update existing collaboration status
        existingCollaboration.status = 'accepted';
        existingCollaboration.respondedAt = new Date();
        updatedStatus = 'accepted';
      } else {
        // Add new collaboration record
        project.collaborators.push({
          user: userId,
          status: 'accepted',
          invitedAt: new Date(),
          respondedAt: new Date()
        });
        updatedStatus = 'accepted';
      }
    } else if (existingCollaboration && existingCollaboration.status === 'pending') {
      // Check if there are pending invitations on GitHub
      try {
        const invitations = await githubService.getInvitations(owner, repo);
        const pendingInvitation = invitations.find(inv => inv.login === user.username);
        
        if (!pendingInvitation) {
          // No pending invitation found, mark as declined
          existingCollaboration.status = 'declined';
          existingCollaboration.respondedAt = new Date();
          updatedStatus = 'declined';
        }
      } catch (invitationError) {
        console.error('Error checking invitations:', invitationError.message);
      }
    }

    if (updatedStatus) {
      await project.save();
    }

    return res.status(200).json({
      githubStatus,
      updatedStatus,
      message: updatedStatus 
        ? `Collaboration status updated to: ${updatedStatus}`
        : 'No status update needed'
    });
  } catch (err) {
    console.error('Sync GitHub collaboration status error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get recent commits for a project
export const getProjectCommits = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessToken } = req.body;
    const { per_page = 5 } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    // Get project details
    const project = await Projects.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.projectLink) {
      return res.status(400).json({ error: "Project does not have a GitHub repository link" });
    }

    // Parse repository URL to get owner and repo
    const { owner, repo } = GitHubService.parseRepoUrl(project.projectLink);

    // Fetch commits from GitHub
    const githubService = new GitHubService(accessToken);
    const commits = await githubService.getCommits(owner, repo, { 
      per_page: parseInt(per_page) 
    });

    // Transform commits data to match the frontend format
    const transformedCommits = commits.map(commit => ({
      id: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        avatar: commit.author?.avatar_url || null,
        username: commit.author?.login || null
      },
      date: commit.commit.author.date,
      url: commit.html_url,
      sha: commit.sha.substring(0, 7) // Short SHA
    }));

    res.json({
      success: true,
      data: transformedCommits,
      count: transformedCommits.length,
      repository: {
        owner,
        repo,
        url: project.projectLink
      }
    });
  } catch (err) {
    console.error('Get project commits error:', err);
    return res.status(500).json({ 
      error: "Failed to fetch commits",
      details: err.message 
    });
  }
};