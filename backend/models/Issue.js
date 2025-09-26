import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  githubIssueId: {
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
    enum: ['open', 'closed'],
    default: 'open'
  },
  labels: [{
    name: String,
    color: String,
    description: String
  }],
  assignees: [{
    githubId: Number,
    username: String,
    name: String,
    avatar: String
  }],
  author: {
    githubId: Number,
    username: String,
    name: String,
    avatar: String
  },
  githubUrl: {
    type: String,
    required: true
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
  comments: {
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
issueSchema.index({ githubIssueId: 1 });
issueSchema.index({ 'repository.fullName': 1 });
issueSchema.index({ 'repository.owner': 1, 'repository.name': 1 });
issueSchema.index({ state: 1 });
issueSchema.index({ 'author.githubId': 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ updatedAt: -1 });

// Virtual for issue number
issueSchema.virtual('number').get(function() {
  return this.githubIssueId;
});

// Method to update issue state
issueSchema.methods.updateState = function(newState) {
  this.state = newState;
  if (newState === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  } else if (newState === 'open') {
    this.closedAt = null;
  }
  return this.save();
};

// Method to add assignee
issueSchema.methods.addAssignee = function(assignee) {
  const existingAssignee = this.assignees.find(a => a.githubId === assignee.githubId);
  if (!existingAssignee) {
    this.assignees.push(assignee);
  }
  return this.save();
};

// Method to remove assignee
issueSchema.methods.removeAssignee = function(githubId) {
  this.assignees = this.assignees.filter(a => a.githubId !== githubId);
  return this.save();
};

// Method to add label
issueSchema.methods.addLabel = function(label) {
  const existingLabel = this.labels.find(l => l.name === label.name);
  if (!existingLabel) {
    this.labels.push(label);
  }
  return this.save();
};

// Method to remove label
issueSchema.methods.removeLabel = function(labelName) {
  this.labels = this.labels.filter(l => l.name !== labelName);
  return this.save();
};

// Static method to find issues by repository
issueSchema.statics.findByRepository = function(owner, repoName) {
  return this.find({ 
    'repository.owner': owner, 
    'repository.name': repoName 
  }).sort({ createdAt: -1 });
};

// Static method to find issues by author
issueSchema.statics.findByAuthor = function(githubId) {
  return this.find({ 'author.githubId': githubId }).sort({ createdAt: -1 });
};

// Static method to find open issues
issueSchema.statics.findOpen = function() {
  return this.find({ state: 'open' }).sort({ createdAt: -1 });
};

// Static method to find closed issues
issueSchema.statics.findClosed = function() {
  return this.find({ state: 'closed' }).sort({ closedAt: -1 });
};

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
