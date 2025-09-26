import DatabaseService from "../services/databaseService.js";
import Projects from "../models/Projects.js";

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
      .populate("user", "name avatar username");

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
    .populate("feedback.mentor", "name organization role profilePhotoUrl");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json(project);
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