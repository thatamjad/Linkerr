const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  min: Number,
  max: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  period: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'yearly'
  },
  isNegotiable: {
    type: Boolean,
    default: true
  }
});

const benefitsSchema = new mongoose.Schema({
  healthInsurance: Boolean,
  dentalInsurance: Boolean,
  visionInsurance: Boolean,
  retirement401k: Boolean,
  paidTimeOff: Boolean,
  sickLeave: Boolean,
  parentalLeave: Boolean,
  flexibleSchedule: Boolean,
  remoteWork: Boolean,
  professionalDevelopment: Boolean,
  tuitionReimbursement: Boolean,
  gymMembership: Boolean,
  transportationAllowance: Boolean,
  mealAllowance: Boolean,
  stockOptions: Boolean,
  bonuses: Boolean,
  other: [String]
});

const applicationProcessSchema = new mongoose.Schema({
  steps: [{
    name: String,
    description: String,
    order: Number,
    estimatedDuration: String
  }],
  requiredDocuments: [{
    type: String,
    enum: ['resume', 'cover_letter', 'portfolio', 'references', 'transcript', 'certification', 'other'],
    required: Boolean,
    description: String
  }],
  applicationDeadline: Date,
  expectedStartDate: Date,
  interviewProcess: {
    hasPhoneScreening: Boolean,
    hasVideoInterview: Boolean,
    hasInPersonInterview: Boolean,
    hasTechnicalAssessment: Boolean,
    hasTakeHomeAssignment: Boolean,
    estimatedTimeframe: String
  }
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    website: String,
    description: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: String,
    founded: Number,
    headquarters: String,
    culture: [String],
    benefits: benefitsSchema,
    rating: {
      overall: Number,
      workLifeBalance: Number,
      compensation: Number,
      culture: Number,
      careerOpportunities: Number,
      management: Number,
      reviewCount: Number
    }
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'not_required']
      },
      field: String,
      preferred: Boolean
    },
    experience: {
      min: Number,
      max: Number,
      level: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive']
      }
    },
    skills: {
      required: [String],
      preferred: [String],
      nice_to_have: [String]
    },
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native']
      },
      required: Boolean
    }],
    certifications: [String],
    other: [String]
  },
  responsibilities: [String],
  location: {
    type: {
      type: String,
      enum: ['on_site', 'remote', 'hybrid'],
      required: true
    },
    city: String,
    state: String,
    country: String,
    zipCode: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    remotePolicy: String,
    relocationAssistance: Boolean
  },
  employment: {
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship', 'volunteer', 'freelance'],
      required: true
    },
    duration: String, // For contract/temporary positions
    schedule: String,
    startDate: Date,
    isUrgent: Boolean
  },
  salary: salarySchema,
  applicationProcess: applicationProcessSchema,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  source: {
    platform: {
      type: String,
      enum: ['internal', 'linkedin', 'indeed', 'glassdoor', 'adzuna', 'company_website', 'recruiter', 'other']
    },
    url: String,
    externalId: String,
    lastSynced: Date
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'filled', 'expired', 'cancelled'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'internal', 'recruiter_only'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  sponsored: {
    type: Boolean,
    default: false
  },
  sponsoredUntil: Date,
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'phone_screen', 'interview_scheduled', 'interviewed', 'reference_check', 'offer_made', 'offer_accepted', 'offer_declined', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    coverLetter: String,
    resume: String,
    portfolio: String,
    notes: String,
    rating: Number,
    feedback: String,
    interviewDate: Date,
    salary_expectation: salarySchema,
    availability: Date,
    lastUpdated: {
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
    source: String,
    userAgent: String,
    ipAddress: String
  }],
  saves: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    platform: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  category: {
    primary: String,
    secondary: [String]
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  expiresAt: Date,
  applicationsDeadline: Date,
  maxApplications: Number,
  isEqualOpportunity: {
    type: Boolean,
    default: true
  },
  diversity: {
    encouragesWomen: Boolean,
    encouragesMinorities: Boolean,
    encouragesVeterans: Boolean,
    encouragesDisabled: Boolean,
    lgbtqFriendly: Boolean
  },
  workEnvironment: {
    teamSize: Number,
    managementStyle: String,
    workCulture: [String],
    travelRequired: {
      type: String,
      enum: ['none', 'minimal', 'moderate', 'frequent']
    },
    overtime: Boolean,
    dresscode: String
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    applicationRate: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotionDetails: {
    budget: Number,
    targetAudience: {
      locations: [String],
      skills: [String],
      experience: [String],
      industries: [String]
    },
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications ? this.applications.length : 0;
});

// Virtual for view count
jobSchema.virtual('viewCount').get(function() {
  return this.views ? this.views.length : 0;
});

// Virtual for save count
jobSchema.virtual('saveCount').get(function() {
  return this.saves ? this.saves.length : 0;
});

// Virtual for share count
jobSchema.virtual('shareCount').get(function() {
  return this.shares ? this.shares.length : 0;
});

// Virtual for days since posted
jobSchema.virtual('daysAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for application deadline status
jobSchema.virtual('applicationStatus').get(function() {
  if (!this.applicationsDeadline) return 'open';
  
  const now = new Date();
  if (this.applicationsDeadline < now) return 'expired';
  
  const daysUntilDeadline = Math.ceil((this.applicationsDeadline - now) / (1000 * 60 * 60 * 24));
  if (daysUntilDeadline <= 7) return 'closing_soon';
  
  return 'open';
});

// Method to check if user has applied
jobSchema.methods.hasUserApplied = function(userId) {
  return this.applications.some(app => app.user.toString() === userId.toString());
};

// Method to check if user has saved
jobSchema.methods.hasUserSaved = function(userId) {
  return this.saves.some(save => save.user.toString() === userId.toString());
};

// Method to get user's application
jobSchema.methods.getUserApplication = function(userId) {
  return this.applications.find(app => app.user.toString() === userId.toString());
};

// Pre-save middleware to generate slug
jobSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('company.name')) {
    const slugBase = `${this.title}-${this.company.name}`.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
    
    this.slug = slugBase;
  }
  next();
});

// Pre-save middleware to update analytics
jobSchema.pre('save', function(next) {
  if (this.isModified('applications')) {
    this.analytics.applications = this.applications.length;
  }
  if (this.isModified('saves')) {
    this.analytics.saves = this.saves.length;
  }
  if (this.isModified('shares')) {
    this.analytics.shares = this.shares.length;
  }
  if (this.isModified('views')) {
    this.analytics.clicks = this.views.length;
  }
  
  // Calculate rates
  if (this.analytics.impressions > 0) {
    this.analytics.clickThroughRate = (this.analytics.clicks / this.analytics.impressions) * 100;
    this.analytics.applicationRate = (this.analytics.applications / this.analytics.impressions) * 100;
  }
  
  next();
});

// Static method for job matching
jobSchema.statics.getMatchingJobs = async function(userProfile, limit = 20) {
  const pipeline = [];
  
  // Match active jobs
  pipeline.push({
    $match: {
      status: 'active',
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }
  });
  
  // Add scoring based on user profile
  const scoringStage = {
    $addFields: {
      matchScore: {
        $add: [
          // Skill matching
          {
            $multiply: [
              {
                $size: {
                  $setIntersection: [
                    '$requirements.skills.required',
                    userProfile.skills?.map(s => s.name) || []
                  ]
                }
              },
              10
            ]
          },
          // Experience level matching
          {
            $cond: {
              if: {
                $and: [
                  { $gte: [userProfile.experience?.totalYears || 0, '$requirements.experience.min'] },
                  { $lte: [userProfile.experience?.totalYears || 0, '$requirements.experience.max'] }
                ]
              },
              then: 5,
              else: 0
            }
          },
          // Industry matching
          {
            $cond: {
              if: { $eq: ['$company.industry', userProfile.industry] },
              then: 3,
              else: 0
            }
          },
          // Location preference matching
          {
            $cond: {
              if: { $eq: ['$location.city', userProfile.location] },
              then: 2,
              else: 0
            }
          }
        ]
      }
    }
  };
  
  pipeline.push(scoringStage);
  
  // Sort by match score and recency
  pipeline.push({
    $sort: {
      matchScore: -1,
      createdAt: -1
    }
  });
  
  pipeline.push({ $limit: limit });
  
  return this.aggregate(pipeline);
};

// Indexes for efficient queries
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'company.name': 1 });
jobSchema.index({ 'location.city': 1, 'location.state': 1 });
jobSchema.index({ 'employment.type': 1 });
jobSchema.index({ 'requirements.skills.required': 1 });
jobSchema.index({ 'requirements.experience.level': 1 });
jobSchema.index({ expiresAt: 1 });
jobSchema.index({ featured: 1, createdAt: -1 });
jobSchema.index({ sponsored: 1, createdAt: -1 });
jobSchema.index({ tags: 1 });
jobSchema.index({ 'category.primary': 1 });
// jobSchema.index({ slug: 1 }, { unique: true }); // Removed duplicate index (unique: true in schema already creates this)
jobSchema.index({ postedBy: 1, status: 1 });

// Compound indexes
jobSchema.index({ status: 1, featured: 1, createdAt: -1 });
jobSchema.index({ status: 1, 'location.type': 1, createdAt: -1 });
jobSchema.index({ status: 1, 'employment.type': 1, createdAt: -1 });
jobSchema.index({ 'source.platform': 1, 'source.externalId': 1 });

module.exports = mongoose.model('Job', jobSchema);
