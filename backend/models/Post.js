const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 200
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'link'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  duration: Number, // For videos
  dimensions: {
    width: Number,
    height: Number
  },
  alt: String,
  caption: String
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: 3000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'article', 'poll', 'event', 'celebration', 'job_post', 'share'],
    default: 'text'
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'followers', 'private'],
    default: 'public'
  },
  media: [mediaSchema],
  mediaUrl: String, // For backward compatibility with tests
  poll: {
    question: {
      type: String,
      maxlength: 500
    },
    options: [pollOptionSchema],
    allowMultiple: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  event: {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    location: String,
    eventType: {
      type: String,
      enum: ['online', 'offline', 'hybrid']
    },
    attendees: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['going', 'interested', 'not_going'],
        default: 'interested'
      },
      respondedAt: {
        type: Date,
        default: Date.now
      }
    }],
    maxAttendees: Number,
    registrationUrl: String
  },
  article: {
    title: String,
    subtitle: String,
    coverImage: String,
    readTime: Number, // in minutes
    tags: [String],
    publishedAt: Date,
    isDraft: {
      type: Boolean,
      default: false
    }
  },
  jobPost: {
    title: String,
    company: String,
    location: String,
    salary: {
      min: Number,
      max: Number,
      currency: String,
      type: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly']
      }
    },
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship', 'volunteer']
    },
    workLocation: {
      type: String,
      enum: ['on_site', 'remote', 'hybrid']
    },
    requirements: [String],
    benefits: [String],
    applicationUrl: String,
    applicationDeadline: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'],
      default: 'like'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  bookmarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookmarkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    duration: Number // in seconds
  }],
  tags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [String],
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionDetails: {
    budget: Number,
    targetAudience: {
      locations: [String],
      industries: [String],
      jobTitles: [String],
      companies: [String]
    },
    startDate: Date,
    endDate: Date,
    clicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    }
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'violence', 'false_information', 'inappropriate_content', 'copyright', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: String,
  blockedAt: Date,
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    profileClicks: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares ? this.shares.length : 0;
});

// Virtual for view count
postSchema.virtual('viewCount').get(function() {
  return this.views ? this.views.length : 0;
});

// Virtual for engagement count
postSchema.virtual('engagementCount').get(function() {
  return (this.likes?.length || 0) + (this.comments?.length || 0) + (this.shares?.length || 0);
});

// Method to check if user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to check if user has bookmarked the post
postSchema.methods.isBookmarkedBy = function(userId) {
  return this.bookmarks.some(bookmark => bookmark.user.toString() === userId.toString());
};

// Pre-save middleware to extract hashtags and mentions
postSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    // Extract hashtags
    const hashtagRegex = /#[\w]+/g;
    const hashtags = this.content.match(hashtagRegex);
    if (hashtags) {
      this.hashtags = [...new Set(hashtags.map(tag => tag.toLowerCase()))];
    }

    // Extract mentions (assuming @username format)
    const mentionRegex = /@[\w.]+/g;
    const mentions = this.content.match(mentionRegex);
    if (mentions) {
      // You would need to resolve usernames to user IDs here
      // This is a placeholder - implement username to ID resolution
    }
  }
  next();
});

// Indexes for efficient queries
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ 'comments.author': 1 });
postSchema.index({ type: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'jobPost.isActive': 1, 'jobPost.applicationDeadline': 1 });
postSchema.index({ 'event.startDate': 1 });
postSchema.index({ 'poll.expiresAt': 1, 'poll.isActive': 1 });

// Text search index
postSchema.index({
  content: 'text',
  'article.title': 'text',
  'article.subtitle': 'text',
  'jobPost.title': 'text',
  'jobPost.company': 'text',
  'event.title': 'text',
  'event.description': 'text'
});

// Compound indexes for complex queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
