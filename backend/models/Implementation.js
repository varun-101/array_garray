import mongoose from "mongoose";

const implementationSchema = new mongoose.Schema({
  // Basic implementation details
  implementationId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Security', 'Performance', 'Testing', 'Quality', 'Documentation', 'DevOps', 'Feature', 'Custom', 'Mentor Feedback'],
    default: 'Quality'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  estimatedTime: {
    type: String,
    required: false,
    default: '1-2 hours'
  },

  // Project and repository information
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  repoUrl: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  techStack: [{
    type: String,
    trim: true
  }],

  // Implementation status and results
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Code generation results
  codeGeneration: {
    success: {
      type: Boolean,
      default: false
    },
    branchName: {
      type: String,
      required: false
    },
    commitHash: {
      type: String,
      required: false
    },
    modifiedFiles: [{
      type: String,
      trim: true
    }],
    error: {
      type: String,
      required: false
    },
    generatedAt: {
      type: Date,
      required: false
    }
  },

  // Pull request information
  pullRequest: {
    success: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      required: false
    },
    number: {
      type: Number,
      required: false
    },
    state: {
      type: String,
      enum: ['open', 'closed', 'merged'],
      required: false
    },
    error: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      required: false
    }
  },

  // Deployment information
  deployment: {
    success: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      required: false
    },
    deploymentId: {
      type: String,
      required: false
    },
    branchName: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['pending', 'building', 'ready', 'error', 'cancelled'],
      default: 'pending'
    },
    error: {
      type: String,
      required: false
    },
    deployedAt: {
      type: Date,
      required: false
    },
    buildTime: {
      type: Number, // in milliseconds
      required: false
    }
  },

  // AI analysis data used for implementation
  analysisData: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },

  // Custom prompt and mentor feedback
  customPrompt: {
    type: String,
    required: false,
    trim: true
  },
  mentorFeedback: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },

  // Implementation metadata
  startedAt: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  duration: {
    type: Number, // in milliseconds
    required: false
  },

  // User and session information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  sessionId: {
    type: String,
    required: false,
    index: true
  },

  // Batch implementation information
  batchId: {
    type: String,
    required: false,
    index: true
  },
  batchOrder: {
    type: Number,
    required: false
  },

  // Implementation logs and details
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'success'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    }
  }],

  // Performance metrics
  metrics: {
    filesProcessed: {
      type: Number,
      default: 0
    },
    linesAdded: {
      type: Number,
      default: 0
    },
    linesRemoved: {
      type: Number,
      default: 0
    },
    testCoverage: {
      type: Number,
      default: 0
    }
  },

  // Error handling
  error: {
    message: {
      type: String,
      required: false
    },
    stack: {
      type: String,
      required: false
    },
    occurredAt: {
      type: Date,
      required: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
implementationSchema.index({ implementationId: 1 });
implementationSchema.index({ repoUrl: 1, status: 1 });
implementationSchema.index({ projectName: 1, status: 1 });
implementationSchema.index({ userId: 1, createdAt: -1 });
implementationSchema.index({ batchId: 1 });
implementationSchema.index({ status: 1, createdAt: -1 });
implementationSchema.index({ category: 1, difficulty: 1 });

// Virtual for implementation duration
implementationSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return null;
  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for success rate
implementationSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed' && this.codeGeneration.success;
});

// Method to update status
implementationSchema.methods.updateStatus = function(newStatus, progress = null) {
  this.status = newStatus;
  if (progress !== null) {
    this.progress = progress;
  }
  
  if (newStatus === 'processing' && !this.startedAt) {
    this.startedAt = new Date();
  } else if ((newStatus === 'completed' || newStatus === 'failed') && !this.completedAt) {
    this.completedAt = new Date();
    if (this.startedAt) {
      this.duration = this.completedAt.getTime() - this.startedAt.getTime();
    }
  }
  
  return this.save();
};

// Method to add log entry
implementationSchema.methods.addLog = function(level, message, details = null) {
  this.logs.push({
    level,
    message,
    details
  });
  return this.save();
};

// Method to update code generation results
implementationSchema.methods.updateCodeGeneration = function(results) {
  this.codeGeneration = {
    ...this.codeGeneration,
    ...results,
    generatedAt: new Date()
  };
  return this.save();
};

// Method to update pull request information
implementationSchema.methods.updatePullRequest = function(prData) {
  this.pullRequest = {
    ...this.pullRequest,
    ...prData
  };
  return this.save();
};

// Method to update deployment information
implementationSchema.methods.updateDeployment = function(deploymentData) {
  this.deployment = {
    ...this.deployment,
    ...deploymentData,
    deployedAt: deploymentData.success ? new Date() : this.deployment.deployedAt
  };
  return this.save();
};

// Method to update metrics
implementationSchema.methods.updateMetrics = function(metrics) {
  this.metrics = {
    ...this.metrics,
    ...metrics
  };
  return this.save();
};

// Static method to find implementations by repository
implementationSchema.statics.findByRepository = function(repoUrl, status = null) {
  const query = { repoUrl };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find implementations by project
implementationSchema.statics.findByProject = function(projectName, status = null) {
  const query = { projectName };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find implementations by user
implementationSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find batch implementations
implementationSchema.statics.findByBatch = function(batchId) {
  return this.find({ batchId }).sort({ batchOrder: 1 });
};

// Static method to get implementation statistics
implementationSchema.statics.getStatistics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        averageDuration: { $avg: '$duration' },
        totalFilesProcessed: { $sum: '$metrics.filesProcessed' },
        totalLinesAdded: { $sum: '$metrics.linesAdded' },
        totalLinesRemoved: { $sum: '$metrics.linesRemoved' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get category statistics
implementationSchema.statics.getCategoryStatistics = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        averageDuration: { $avg: '$duration' }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

const Implementation = mongoose.model('Implementation', implementationSchema);

export default Implementation;
