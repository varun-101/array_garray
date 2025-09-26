import mongoose from "mongoose";

const pullRequestSchema = new mongoose.Schema({
  githubPrId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  repository: {
    owner: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    }
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: false,
    default: ""
  },
  state: {
    type: String,
    enum: ['open', 'closed', 'merged'],
    default: 'open'
  },
  draft: {
    type: Boolean,
    default: false
  },
  head: {
    ref: {
      type: String,
      required: true
    },
    sha: {
      type: String,
      required: true
    },
    user: {
      githubId: Number,
      username: String,
      name: String,
      avatar: String
    }
  },
  base: {
    ref: {
      type: String,
      required: true
    },
    sha: {
      type: String,
      required: true
    },
    user: {
      githubId: Number,
      username: String,
      name: String,
      avatar: String
    }
  },
  author: {
    githubId: Number,
    username: String,
    name: String,
    avatar: String
  },
  assignees: [{
    githubId: Number,
    username: String,
    name: String,
    avatar: String
  }],
  reviewers: [{
    githubId: Number,
    username: String,
    name: String,
    avatar: String,
    state: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'],
      default: 'PENDING'
    }
  }],
  labels: [{
    name: String,
    color: String,
    description: String
  }],
  githubUrl: {
    type: String,
    required: true
  },
  diffUrl: {
    type: String,
    required: false
  },
  patchUrl: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  closedAt: {
    type: Date,
    required: false,
    default: null
  },
  mergedAt: {
    type: Date,
    required: false,
    default: null
  },
  mergeCommitSha: {
    type: String,
    required: false,
    default: null
  },
  mergeable: {
    type: Boolean,
    required: false,
    default: null
  },
  mergeableState: {
    type: String,
    enum: ['clean', 'dirty', 'unstable', 'blocked'],
    required: false,
    default: null
  },
  comments: {
    type: Number,
    default: 0
  },
  reviewComments: {
    type: Number,
    default: 0
  },
  commits: {
    type: Number,
    default: 0
  },
  additions: {
    type: Number,
    default: 0
  },
  deletions: {
    type: Number,
    default: 0
  },
  changedFiles: {
    type: Number,
    default: 0
  },
  reactions: {
    total: {
      type: Number,
      default: 0
    },
    thumbsUp: {
      type: Number,
      default: 0
    },
    thumbsDown: {
      type: Number,
      default: 0
    },
    laugh: {
      type: Number,
      default: 0
    },
    hooray: {
      type: Number,
      default: 0
    },
    confused: {
      type: Number,
      default: 0
    },
    heart: {
      type: Number,
      default: 0
    },
    rocket: {
      type: Number,
      default: 0
    },
    eyes: {
      type: Number,
      default: 0
    }
  },
  milestone: {
    title: String,
    description: String,
    state: String,
    dueOn: Date
  },
  isCreatedByApp: {
    type: Boolean,
    default: false
  },
  appMetadata: {
    createdVia: {
      type: String,
      enum: ['web', 'api', 'mobile'],
      default: 'api'
    },
    sessionId: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
pullRequestSchema.index({ githubPrId: 1 });
pullRequestSchema.index({ 'repository.fullName': 1 });
pullRequestSchema.index({ 'repository.owner': 1, 'repository.name': 1 });
pullRequestSchema.index({ state: 1 });
pullRequestSchema.index({ 'author.githubId': 1 });
pullRequestSchema.index({ createdAt: -1 });
pullRequestSchema.index({ updatedAt: -1 });
pullRequestSchema.index({ mergedAt: -1 });

// Virtual for PR number
pullRequestSchema.virtual('number').get(function() {
  return this.githubPrId;
});

// Virtual for merge status
pullRequestSchema.virtual('isMerged').get(function() {
  return this.state === 'merged' && this.mergedAt !== null;
});

// Method to update PR state
pullRequestSchema.methods.updateState = function(newState) {
  this.state = newState;
  if (newState === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  } else if (newState === 'merged' && !this.mergedAt) {
    this.mergedAt = new Date();
  }
  return this.save();
};

// Method to add assignee
pullRequestSchema.methods.addAssignee = function(assignee) {
  const existingAssignee = this.assignees.find(a => a.githubId === assignee.githubId);
  if (!existingAssignee) {
    this.assignees.push(assignee);
  }
  return this.save();
};

// Method to remove assignee
pullRequestSchema.methods.removeAssignee = function(githubId) {
  this.assignees = this.assignees.filter(a => a.githubId !== githubId);
  return this.save();
};

// Method to add reviewer
pullRequestSchema.methods.addReviewer = function(reviewer) {
  const existingReviewer = this.reviewers.find(r => r.githubId === reviewer.githubId);
  if (!existingReviewer) {
    this.reviewers.push({ ...reviewer, state: 'PENDING' });
  }
  return this.save();
};

// Method to update reviewer state
pullRequestSchema.methods.updateReviewerState = function(githubId, state) {
  const reviewer = this.reviewers.find(r => r.githubId === githubId);
  if (reviewer) {
    reviewer.state = state;
  }
  return this.save();
};

// Method to add label
pullRequestSchema.methods.addLabel = function(label) {
  const existingLabel = this.labels.find(l => l.name === label.name);
  if (!existingLabel) {
    this.labels.push(label);
  }
  return this.save();
};

// Method to remove label
pullRequestSchema.methods.removeLabel = function(labelName) {
  this.labels = this.labels.filter(l => l.name !== labelName);
  return this.save();
};

// Static method to find PRs by repository
pullRequestSchema.statics.findByRepository = function(owner, repoName) {
  return this.find({ 
    'repository.owner': owner, 
    'repository.name': repoName 
  }).sort({ createdAt: -1 });
};

// Static method to find PRs by author
pullRequestSchema.statics.findByAuthor = function(githubId) {
  return this.find({ 'author.githubId': githubId }).sort({ createdAt: -1 });
};

// Static method to find open PRs
pullRequestSchema.statics.findOpen = function() {
  return this.find({ state: 'open' }).sort({ createdAt: -1 });
};

// Static method to find merged PRs
pullRequestSchema.statics.findMerged = function() {
  return this.find({ state: 'merged' }).sort({ mergedAt: -1 });
};

// Static method to find closed PRs
pullRequestSchema.statics.findClosed = function() {
  return this.find({ state: 'closed' }).sort({ closedAt: -1 });
};

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

export default PullRequest;
