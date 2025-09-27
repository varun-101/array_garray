import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: false,
    default: null
  },
  name: {
    type: String,
    required: false,
    default: null
  },
  avatar: {
    type: String,
    required: false,
    default: null
  },
  githubUrl: {
    type: String,
    required: false,
    default: null
  },
  accessToken: {
    type: String,
    required: true
  },
  tokenExpiresAt: {
    type: Date,
    required: false,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  repositories: [{
    name: String,
    fullName: String,
    description: String,
    private: Boolean,
    url: String,
    cloneUrl: String,
    language: String,
    stars: Number,
    forks: Number,
    lastUpdated: Date
  }],
  stats: {
    totalRepos: {
      type: Number,
      default: 0
    },
    totalIssues: {
      type: Number,
      default: 0
    },
    totalPullRequests: {
      type: Number,
      default: 0
    }
  },
  // Profile fields from Profile.tsx
  bio: {
    type: String,
    required: false,
    default: null
  },
  skills: [{
    type: String,
    required: false
  }],
  interests: [{
    type: String,
    required: false
  }],
  joined: {
    type: String,
    required: false,
    default: null
  },
  title: {
    type: String,
    required: false,
    default: 'Aspiring Software Engineer'
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ githubId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `https://github.com/${this.username}`;
});

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Method to update user stats
userSchema.methods.updateStats = function(stats) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

// Method to add repository
userSchema.methods.addRepository = function(repoData) {
  const existingRepo = this.repositories.find(repo => repo.fullName === repoData.fullName);
  if (!existingRepo) {
    this.repositories.push(repoData);
    this.stats.totalRepos = this.repositories.length;
  }
  return this.save();
};

// Method to remove repository
userSchema.methods.removeRepository = function(fullName) {
  this.repositories = this.repositories.filter(repo => repo.fullName !== fullName);
  this.stats.totalRepos = this.repositories.length;
  return this.save();
};

// Method to update profile information
userSchema.methods.updateProfile = function(profileData) {
  const allowedFields = ['name', 'bio', 'skills', 'interests', 'joined', 'title', 'avatar'];
  allowedFields.forEach(field => {
    if (profileData[field] !== undefined) {
      this[field] = profileData[field];
    }
  });
  return this.save();
};

// Static method to find user by GitHub ID
userSchema.statics.findByGitHubId = function(githubId) {
  return this.findOne({ githubId });
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isModified('repositories')) {
    this.stats.totalRepos = this.repositories.length;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
