import Mentor from "../models/Mentor.js";
import bcrypt from "bcryptjs";

export const createMentor = async (req, res) => {
  try {
    const {
      name,
      organization,
      role,
      email,
      password,
      profilePhotoUrl,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = req.body;

    // Validate required fields
    if (!name || !organization || !role || !email || !password) {
      return res.status(400).json({
        error: "name, organization, role, email, and password are required",
      });
    }

    // Check if mentor already exists
    const existingMentor = await Mentor.findByEmail(email);
    if (existingMentor) {
      return res.status(409).json({ error: "Mentor with this email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create mentor
    const mentor = await Mentor.create({
      name,
      organization,
      role,
      email,
      password: hashedPassword,
      profilePhotoUrl: profilePhotoUrl || null,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      portfolioUrl: portfolioUrl || null,
    });

    // Return mentor without password
    const mentorResponse = {
      _id: mentor._id,
      name: mentor.name,
      organization: mentor.organization,
      role: mentor.role,
      email: mentor.email,
      profilePhotoUrl: mentor.profilePhotoUrl,
      linkedinUrl: mentor.linkedinUrl,
      githubUrl: mentor.githubUrl,
      portfolioUrl: mentor.portfolioUrl,
      isActive: mentor.isActive,
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt,
    };

    return res.status(201).json(mentorResponse);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(mentors);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Mentor ID is required" });
    }

    const mentor = await Mentor.findById(id).select("-password");

    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    return res.status(200).json(mentor);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const loginMentor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find mentor by email
    const mentor = await Mentor.findByEmail(email);
    if (!mentor) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if mentor is active
    if (!mentor.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, mentor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    await mentor.updateLastLogin();

    // Return mentor data without password
    const mentorResponse = {
      _id: mentor._id,
      name: mentor.name,
      organization: mentor.organization,
      role: mentor.role,
      email: mentor.email,
      profilePhotoUrl: mentor.profilePhotoUrl,
      linkedinUrl: mentor.linkedinUrl,
      githubUrl: mentor.githubUrl,
      portfolioUrl: mentor.portfolioUrl,
      isActive: mentor.isActive,
      lastLoginAt: mentor.lastLoginAt,
      createdAt: mentor.createdAt,
      updatedAt: mentor.updatedAt,
    };

    return res.status(200).json(mentorResponse);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};