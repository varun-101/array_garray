import mongoose from "mongoose";

const projectsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectName: { type: String, required: true, trim: true },
    projectDescription: { type: String, required: true, trim: true },
    projectLink: { type: String, required: true, trim: true },
    techStack: [{ type: String, trim: true }],
    // Deprecated single image field (kept for backward compatibility)
    projectImgUrl: { type: String, required: false, default: null },
    // New media arrays
    projectImgUrls: [{ type: String, trim: true }],
    projectVideoUrls: [{ type: String, trim: true }],
    demoUrl: { type: String, required: false, default: null },
    category: { type: String, required: false, default: '' },
    difficulty: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
    estimatedTime: { type: String, required: false, default: '' },
    tags: [{ type: String, trim: true }],
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);

projectsSchema.index({ user: 1, projectName: 1 }, { unique: false });

const Projects = mongoose.model("Projects", projectsSchema);

export default Projects;


