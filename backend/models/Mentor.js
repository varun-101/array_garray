import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    profilePhotoUrl: { type: String, required: false, default: null },
    linkedinUrl: { type: String, required: false, default: null },
    githubUrl: { type: String, required: false, default: null },
    portfolioUrl: { type: String, required: false, default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for better performance
mentorSchema.index({ email: 1 });
mentorSchema.index({ organization: 1 });
mentorSchema.index({ isActive: 1 });

// Method to update last login
mentorSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Static method to find mentor by email
mentorSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const Mentor = mongoose.model("Mentor", mentorSchema);

export default Mentor;