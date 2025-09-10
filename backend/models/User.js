const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 1000
  }
}, { _id: true });

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  current: {
    type: Boolean,
    default: false
  },
  grade: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: true });

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  endorsements: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    endorsedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: true });

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false, // Allow empty during registration
    trim: true,
    maxlength: 50,
    default: ''
  },
  lastName: {
    type: String,
    required: false, // Allow empty during registration
    trim: true,
    maxlength: 50,
    default: ''
  },
  headline: {
    type: String,
    trim: true,
    maxlength: 220
  },
  summary: {
    type: String,
    maxlength: 2000
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  },
  profilePicture: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  languages: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['Elementary', 'Limited Working', 'Professional Working', 'Full Professional', 'Native']
    }
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expirationDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    url: String
  }],
  interests: [String]
});

const notificationPreferencesSchema = new mongoose.Schema({
  email: {
    newConnections: { type: Boolean, default: true },
    newPosts: { type: Boolean, default: true },
    jobRecommendations: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  },
  push: {
    newConnections: { type: Boolean, default: true },
    newPosts: { type: Boolean, default: false },
    jobRecommendations: { type: Boolean, default: false },
    comments: { type: Boolean, default: true },
    likes: { type: Boolean, default: false },
    messages: { type: Boolean, default: true }
  }
});

const privacySettingsSchema = new mongoose.Schema({
  profileVisibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showPhone: {
    type: Boolean,
    default: false
  },
  allowMessagesFromStrangers: {
    type: Boolean,
    default: true
  },
  showActivity: {
    type: Boolean,
    default: true
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.linkedinId;
    },
    minlength: 6
  },
  profile: {
    type: profileSchema,
    required: false,
    default: () => ({
      firstName: '',
      lastName: '',
      headline: '',
      summary: '',
      location: '',
      industry: '',
      website: '',
      profilePicture: '',
      coverPhoto: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      achievements: [],
      interests: []
    })
  },
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  connectionRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  sentConnectionRequests: [{
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  viewedJobs: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  appliedJobs: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'interview', 'rejected', 'accepted'],
      default: 'applied'
    }
  }],
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  lastActiveAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date,
    userAgent: String,
    ipAddress: String
  }],
  oauthProviders: {
    google: {
      id: String,
      email: String
    },
    linkedin: {
      id: String,
      email: String
    },
    github: {
      id: String,
      email: String
    }
  },
  notificationPreferences: {
    type: notificationPreferencesSchema,
    default: () => ({})
  },
  privacySettings: {
    type: privacySettingsSchema,
    default: () => ({})
  },
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    postViews: {
      type: Number,
      default: 0
    },
    searchAppearances: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.twoFactorSecret;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for connection count
userSchema.virtual('connectionCount').get(function() {
  return this.connections ? this.connections.filter(conn => conn.status === 'accepted').length : 0;
});

// Virtual for mutual connections
userSchema.virtual('mutualConnections').get(function() {
  return this.connections ? this.connections.filter(conn => conn.status === 'accepted') : [];
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // Lock for 2 hours
    };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Index for efficient queries (email index is automatically created by unique: true)
// userSchema.index({ email: 1 }); // Removed duplicate index
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ 'profile.industry': 1 });
userSchema.index({ 'profile.location': 1 });
userSchema.index({ 'profile.skills.name': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActiveAt: -1 });

// Text search index
userSchema.index({
  'profile.firstName': 'text',
  'profile.lastName': 'text',
  'profile.headline': 'text',
  'profile.summary': 'text',
  'profile.skills.name': 'text',
  'profile.industry': 'text'
});

module.exports = mongoose.model('User', userSchema);
