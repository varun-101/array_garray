import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    githubId: { type: Number, required: true, index: true, unique: true },
    ownerLogin: { type: String, required: true, index: true },
    ownerAvatarUrl: { type: String },
    name: { type: String, required: true },
    fullName: { type: String, required: true, index: true },
    description: { type: String },
    private: { type: Boolean, default: false },
    url: { type: String, required: true },
    cloneUrl: { type: String },
    language: { type: String },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    lastUpdated: { type: Date },
    visibility: { type: String },
  },
  { timestamps: true }
);

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;


