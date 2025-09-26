import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema({
  // Repository identification
  repositoryUrl: {
    type: String,
    required: true,
    index: true
  },
  repositoryFullName: {
    type: String,
    required: true,
    index: true // e.g., "owner/repo"
  },
  
  // Project information
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Projects",
    required: false,
    index: true
  },
  projectName: {
    type: String,
    required: true
  },
  
  // Commit tracking
  commitHash: {
    type: String,
    required: true,
    index: true
  },
  commitMessage: {
    type: String,
    required: false
  },
  commitDate: {
    type: Date,
    required: true
  },
  
  // Analysis metadata
  techStack: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: {
    type: String,
    default: 'Web Development'
  },
  
  // AI Analysis results
  analysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    codeQuality: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    maintainability: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    security: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    performance: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    documentation: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    recommendations: [{
      type: String,
      trim: true
    }],
    strengths: [{
      type: String,
      trim: true
    }],
    improvements: [{
      type: String,
      trim: true
    }],
    techStackAnalysis: {
      modern: [{
        type: String,
        trim: true
      }],
      stable: [{
        type: String,
        trim: true
      }],
      emerging: [{
        type: String,
        trim: true
      }]
    }
  },
  
  // Analysis generation metadata
  aiModel: {
    type: String,
    required: true // e.g., "openai/gpt-3.5-turbo"
  },
  aiProvider: {
    type: String,
    default: "OpenRouter"
  },
  tokensUsed: {
    type: Number,
    required: false
  },
  analysisTime: {
    type: Number, // milliseconds
    required: false
  },
  
  // Version and status
  version: {
    type: String,
    default: "1.0"
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'archived'],
    default: 'completed'
  },
  
  // Historical tracking
  isLatest: {
    type: Boolean,
    default: true,
    index: true
  },
  previousAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AIAnalysis",
    required: false
  },
  
  // Code analysis details
  codeMetrics: {
    totalFiles: {
      type: Number,
      required: false
    },
    totalLines: {
      type: Number,
      required: false
    },
    analyzedFiles: {
      type: Number,
      required: false
    },
    languages: [{
      type: String,
      trim: true
    }]
  },
  
  // Error handling
  errors: [{
    type: String,
    trim: true
  }],
  warnings: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
aiAnalysisSchema.index({ repositoryFullName: 1, isLatest: 1 });
aiAnalysisSchema.index({ repositoryFullName: 1, commitHash: 1 });
aiAnalysisSchema.index({ projectId: 1, isLatest: 1 });
aiAnalysisSchema.index({ createdAt: -1 });

// Pre-save middleware to handle latest analysis tracking
aiAnalysisSchema.pre('save', async function(next) {
  // If this is a new latest analysis, mark previous ones as not latest
  if (this.isNew && this.isLatest) {
    await this.constructor.updateMany(
      { 
        repositoryFullName: this.repositoryFullName,
        _id: { $ne: this._id },
        isLatest: true
      },
      { 
        $set: { isLatest: false }
      }
    );
  }
  next();
});

// Methods
aiAnalysisSchema.methods.getScoreImprovement = function(previousAnalysis) {
  if (!previousAnalysis) return null;
  
  return {
    overallScore: this.analysis.overallScore - previousAnalysis.analysis.overallScore,
    codeQuality: this.analysis.codeQuality - previousAnalysis.analysis.codeQuality,
    maintainability: this.analysis.maintainability - previousAnalysis.analysis.maintainability,
    security: this.analysis.security - previousAnalysis.analysis.security,
    performance: this.analysis.performance - previousAnalysis.analysis.performance,
    documentation: this.analysis.documentation - previousAnalysis.analysis.documentation
  };
};

aiAnalysisSchema.methods.generateComparisonSummary = function(previousAnalysis) {
  if (!previousAnalysis) return "This is the first analysis for this repository.";
  
  const improvements = this.getScoreImprovement(previousAnalysis);
  const significantChanges = [];
  
  Object.entries(improvements).forEach(([metric, change]) => {
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? 'improved' : 'decreased';
      significantChanges.push(`${metric} ${direction} by ${Math.abs(change)} points`);
    }
  });
  
  if (significantChanges.length === 0) {
    return "No significant changes in code quality metrics since last analysis.";
  }
  
  return `Since last analysis: ${significantChanges.join(', ')}.`;
};

// Static methods
aiAnalysisSchema.statics.findLatestByRepo = function(repositoryFullName) {
  return this.findOne({ 
    repositoryFullName,
    isLatest: true,
    status: 'completed'
  });
};

aiAnalysisSchema.statics.findByCommit = function(repositoryFullName, commitHash) {
  return this.findOne({ 
    repositoryFullName,
    commitHash,
    status: 'completed'
  });
};

aiAnalysisSchema.statics.getAnalysisHistory = function(repositoryFullName, limit = 10) {
  return this.find({ 
    repositoryFullName,
    status: 'completed'
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

aiAnalysisSchema.statics.archiveOldAnalyses = function(repositoryFullName, keepCount = 5) {
  return this.find({ 
    repositoryFullName,
    status: 'completed',
    isLatest: false
  })
  .sort({ createdAt: -1 })
  .skip(keepCount)
  .then(oldAnalyses => {
    const idsToArchive = oldAnalyses.map(a => a._id);
    return this.updateMany(
      { _id: { $in: idsToArchive } },
      { $set: { status: 'archived' } }
    );
  });
};

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);

export default AIAnalysis;
