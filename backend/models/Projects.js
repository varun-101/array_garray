import mongoose from "mongoose";

const projectsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectName: { type: String, required: true, trim: true },
    projectDescription: { type: String, required: true, trim: true },
    projectLink: { type: String, required: true, trim: true },
    techStack: [{ type: String, trim: true }],
    projectImgUrl: { type: String, required: false, default: null },
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);

projectsSchema.index({ user: 1, projectName: 1 }, { unique: false });

const Projects = mongoose.model("Projects", projectsSchema);

export default Projects;


