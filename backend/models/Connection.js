const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 300,
    trim: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  note: {
    type: String,
    maxlength: 500
  },
  connectionSource: {
    type: String,
    enum: ['search', 'suggestion', 'mutual_connection', 'profile_view', 'post_interaction', 'event', 'import', 'other'],
    default: 'other'
  },
  mutualConnections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String], // For organizing connections
  strength: {
    type: String,
    enum: ['weak', 'medium', 'strong'],
    default: 'weak'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  blockedAt: Date,
  unblockRequested: {
    type: Boolean,
    default: false
  },
  metadata: {
    platform: String, // Where the connection was made
    campaign: String, // Marketing campaign reference
    referrer: String  // How they found each other
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to determine the connection type
connectionSchema.virtual('connectionType').get(function() {
  if (this.mutualConnections && this.mutualConnections.length > 0) {
    return 'mutual';
  }
  return 'direct';
});

// Method to get the other user in the connection
connectionSchema.methods.getOtherUser = function(userId) {
  return this.requester.toString() === userId.toString() ? this.recipient : this.requester;
};

// Method to check if connection is mutual
connectionSchema.methods.isMutual = function() {
  return this.mutualConnections && this.mutualConnections.length > 0;
};

// Method to update interaction
connectionSchema.methods.updateInteraction = function() {
  this.lastInteraction = new Date();
  this.interactionCount += 1;
  return this.save();
};

// Pre-save middleware to update strength based on interactions
connectionSchema.pre('save', function(next) {
  if (this.interactionCount >= 10) {
    this.strength = 'strong';
  } else if (this.interactionCount >= 5) {
    this.strength = 'medium';
  }
  next();
});

// Static method to find mutual connections
connectionSchema.statics.findMutualConnections = async function(user1Id, user2Id) {
  const user1Connections = await this.find({
    $or: [
      { requester: user1Id, status: 'accepted' },
      { recipient: user1Id, status: 'accepted' }
    ]
  }).populate('requester recipient', 'profile.firstName profile.lastName profile.profilePicture');

  const user2Connections = await this.find({
    $or: [
      { requester: user2Id, status: 'accepted' },
      { recipient: user2Id, status: 'accepted' }
    ]
  }).populate('requester recipient', 'profile.firstName profile.lastName profile.profilePicture');

  const user1ConnectedUsers = new Set();
  user1Connections.forEach(conn => {
    const otherUser = conn.requester._id.toString() === user1Id.toString() 
      ? conn.recipient._id.toString() 
      : conn.requester._id.toString();
    user1ConnectedUsers.add(otherUser);
  });

  const mutualConnections = [];
  user2Connections.forEach(conn => {
    const otherUser = conn.requester._id.toString() === user2Id.toString() 
      ? conn.recipient 
      : conn.requester;
    
    if (user1ConnectedUsers.has(otherUser._id.toString())) {
      mutualConnections.push(otherUser);
    }
  });

  return mutualConnections;
};

// Static method to get connection status between two users
connectionSchema.statics.getConnectionStatus = async function(user1Id, user2Id) {
  const connection = await this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id }
    ]
  });

  if (!connection) {
    return 'not_connected';
  }

  return connection.status;
};

// Static method to get connection suggestions for a user
connectionSchema.statics.getConnectionSuggestions = async function(userId, limit = 10) {
  const User = mongoose.model('User');
  
  // Get user's existing connections
  const existingConnections = await this.find({
    $or: [
      { requester: userId },
      { recipient: userId }
    ]
  }).select('requester recipient');

  const connectedUserIds = new Set([userId]);
  existingConnections.forEach(conn => {
    connectedUserIds.add(conn.requester.toString());
    connectedUserIds.add(conn.recipient.toString());
  });

  // Find users with mutual connections
  const suggestions = await User.aggregate([
    {
      $match: {
        _id: { $nin: Array.from(connectedUserIds).map(id => new mongoose.Types.ObjectId(id)) },
        isActive: true
      }
    },
    {
      $lookup: {
        from: 'connections',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$status', 'accepted'] },
                  {
                    $or: [
                      { $eq: ['$requester', '$$userId'] },
                      { $eq: ['$recipient', '$$userId'] }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'connections'
      }
    },
    {
      $addFields: {
        mutualConnectionCount: {
          $size: {
            $filter: {
              input: '$connections',
              cond: {
                $or: [
                  { $in: ['$$this.requester', Array.from(connectedUserIds).slice(1).map(id => new mongoose.Types.ObjectId(id))] },
                  { $in: ['$$this.recipient', Array.from(connectedUserIds).slice(1).map(id => new mongoose.Types.ObjectId(id))] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $match: {
        mutualConnectionCount: { $gt: 0 }
      }
    },
    {
      $sort: { mutualConnectionCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        'profile.firstName': 1,
        'profile.lastName': 1,
        'profile.headline': 1,
        'profile.profilePicture': 1,
        'profile.location': 1,
        'profile.industry': 1,
        mutualConnectionCount: 1
      }
    }
  ]);

  return suggestions;
};

// Indexes for efficient queries
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ status: 1, requestedAt: -1 });
connectionSchema.index({ lastInteraction: -1 });
connectionSchema.index({ strength: 1 });
connectionSchema.index({ connectionSource: 1 });
connectionSchema.index({ tags: 1 });

// Compound indexes
connectionSchema.index({ requester: 1, status: 1, requestedAt: -1 });
connectionSchema.index({ recipient: 1, status: 1, requestedAt: -1 });

module.exports = mongoose.model('Connection', connectionSchema);
