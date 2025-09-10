const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, createError, asyncHandler } = require('../utils/error');
const { validateJobCreation, validateJobUpdate, validatePagination } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get jobs with filtering and search
 * @access  Public
 */
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search query
  const query = { status: 'active' };
  const sortOptions = { createdAt: -1 };

  // Search filters
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { company: { $regex: req.query.search, $options: 'i' } },
      { 'requirements.skills': { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.company) {
    query.company = { $regex: req.query.company, $options: 'i' };
  }

  if (req.query.location) {
    query.$or = [
      { 'location.city': { $regex: req.query.location, $options: 'i' } },
      { 'location.state': { $regex: req.query.location, $options: 'i' } },
      { 'location.country': { $regex: req.query.location, $options: 'i' } }
    ];
  }

  if (req.query.jobType) {
    query.jobType = { $in: req.query.jobType.split(',') };
  }

  if (req.query.workArrangement) {
    query.workArrangement = { $in: req.query.workArrangement.split(',') };
  }

  if (req.query.experienceLevel) {
    query.experienceLevel = { $in: req.query.experienceLevel.split(',') };
  }

  if (req.query.industry) {
    query.industry = { $in: req.query.industry.split(',') };
  }

  if (req.query.skills) {
    query['requirements.skills'] = { $in: req.query.skills.split(',').map(skill => new RegExp(skill, 'i')) };
  }

  // Salary range filter
  if (req.query.minSalary || req.query.maxSalary) {
    query['salary.min'] = {};
    if (req.query.minSalary) {
      query['salary.min'].$gte = parseInt(req.query.minSalary);
    }
    if (req.query.maxSalary) {
      query['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
    }
  }

  // Date filter
  if (req.query.postedSince) {
    const daysAgo = parseInt(req.query.postedSince);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysAgo);
    query.createdAt = { $gte: sinceDate };
  }

  // Sort options
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'salaryHigh':
        sortOptions['salary.max'] = -1;
        break;
      case 'salaryLow':
        sortOptions['salary.min'] = 1;
        break;
      case 'applications':
        sortOptions.applicationCount = -1;
        break;
      case 'views':
        sortOptions.viewCount = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }
  }

  const totalJobs = await Job.countDocuments(query);

  const jobs = await Job.find(query)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company')
    .select('-applications -analytics.viewHistory')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalJobs / limit);

  successResponse(res, 200, 'Jobs retrieved successfully', {
    jobs,
    pagination: {
      currentPage: page,
      totalPages,
      totalJobs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/jobs/my-jobs
 * @desc    Get user's posted jobs
 * @access  Private
 */
router.get('/my-jobs', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status || 'all';

  const query = { postedBy: req.user._id };
  
  if (status !== 'all') {
    query.status = status;
  }

  const totalJobs = await Job.countDocuments(query);

  const jobs = await Job.find(query)
    .select('-analytics.viewHistory')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalJobs / limit);

  successResponse(res, 200, 'User jobs retrieved successfully', {
    jobs,
    pagination: {
      currentPage: page,
      totalPages,
      totalJobs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/jobs/applications
 * @desc    Get user's job applications
 * @access  Private
 */
router.get('/applications', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status || 'all';

  const query = { 'applications.applicant': req.user._id };
  
  if (status !== 'all') {
    query['applications.status'] = status;
  }

  const totalApplications = await Job.countDocuments(query);

  const jobs = await Job.find(query)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company')
    .select('title company location jobType salary applications')
    .sort({ 'applications.appliedAt': -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Transform to show application details
  const applications = jobs.map(job => {
    const userApplication = job.applications.find(
      app => app.applicant.toString() === req.user._id.toString()
    );
    
    return {
      applicationId: userApplication._id,
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        postedBy: job.postedBy
      },
      status: userApplication.status,
      appliedAt: userApplication.appliedAt,
      coverLetter: userApplication.coverLetter,
      resumeUrl: userApplication.resumeUrl,
      followUpDate: userApplication.followUpDate,
      interviewScheduled: userApplication.interviewScheduled,
      notes: userApplication.notes
    };
  });

  const totalPages = Math.ceil(totalApplications / limit);

  successResponse(res, 200, 'User applications retrieved successfully', {
    applications,
    pagination: {
      currentPage: page,
      totalPages,
      totalApplications,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   GET /api/jobs/recommendations
 * @desc    Get personalized job recommendations
 * @access  Private
 */
router.get('/recommendations', authenticateToken, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const recommendations = await Job.getRecommendations(req.user._id, limit);
    
    successResponse(res, 200, 'Job recommendations retrieved successfully', {
      recommendations
    });
  } catch (error) {
    successResponse(res, 200, 'Job recommendations retrieved successfully', {
      recommendations: []
    });
  }
}));

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job details
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company profile.headline')
    .populate('applications.applicant', 'profile.firstName profile.lastName profile.profilePicture profile.headline');

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Increment view count if not the job poster
  if (req.user && job.postedBy._id.toString() !== req.user._id.toString()) {
    job.analytics.viewCount += 1;
    job.analytics.viewHistory.push({
      viewer: req.user._id,
      viewedAt: new Date()
    });
    await job.save();
  } else if (!req.user) {
    job.analytics.viewCount += 1;
    await job.save();
  }

  // Hide application details unless user is the job poster
  let jobData = job.toJSON();
  if (!req.user || job.postedBy._id.toString() !== req.user._id.toString()) {
    jobData.applications = undefined;
    jobData.analytics.viewHistory = undefined;
  }

  successResponse(res, 200, 'Job retrieved successfully', { job: jobData });
}));

/**
 * @route   POST /api/jobs
 * @desc    Create new job posting
 * @access  Private
 */
router.post('/', authenticateToken, validateJobCreation, asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    postedBy: req.user._id,
    company: req.body.company || req.user.company || 'Unknown Company'
  };

  const job = new Job(jobData);
  await job.save();

  const populatedJob = await Job.findById(job._id)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company');

  successResponse(res, 201, 'Job posted successfully', { job: populatedJob });
}));

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting
 * @access  Private (Job poster only)
 */
router.put('/:id', authenticateToken, validateJobUpdate, asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Check if user is the job poster
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to update this job'));
  }

  // Update fields
  Object.assign(job, req.body);
  job.updatedAt = new Date();

  await job.save();

  const updatedJob = await Job.findById(job._id)
    .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company');

  successResponse(res, 200, 'Job updated successfully', { job: updatedJob });
}));

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting
 * @access  Private (Job poster only)
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Check if user is the job poster
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to delete this job'));
  }

  await Job.findByIdAndDelete(req.params.id);

  successResponse(res, 200, 'Job deleted successfully');
}));

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply to job
 * @access  Private
 */
router.post('/:id/apply', authenticateToken, asyncHandler(async (req, res, next) => {
  const { coverLetter, resumeUrl } = req.body;

  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  if (job.status !== 'active') {
    return next(createError(400, 'Job is no longer accepting applications'));
  }

  // Check if user is the job poster
  if (job.postedBy.toString() === req.user._id.toString()) {
    return next(createError(400, 'Cannot apply to your own job posting'));
  }

  // Check if already applied
  const existingApplication = job.applications.find(
    app => app.applicant.toString() === req.user._id.toString()
  );

  if (existingApplication) {
    return next(createError(400, 'Already applied to this job'));
  }

  // Add application
  job.applications.push({
    applicant: req.user._id,
    coverLetter: coverLetter || '',
    resumeUrl: resumeUrl || '',
    appliedAt: new Date(),
    status: 'pending'
  });

  job.applicationCount += 1;
  await job.save();

  // Create notification for job poster
  await Notification.createNotification({
    recipient: job.postedBy,
    sender: req.user._id,
    type: 'job_application',
    title: 'New Job Application',
    message: `${req.user.profile.firstName} ${req.user.profile.lastName} applied to your job: ${job.title}`,
    relatedJob: job._id,
    data: { coverLetter, resumeUrl },
    actionRequired: true
  });

  successResponse(res, 201, 'Application submitted successfully');
}));

/**
 * @route   PUT /api/jobs/:jobId/applications/:applicationId
 * @desc    Update application status (job poster only)
 * @access  Private
 */
router.put('/:jobId/applications/:applicationId', authenticateToken, asyncHandler(async (req, res, next) => {
  const { status, notes, interviewDate } = req.body;
  const { jobId, applicationId } = req.params;

  const job = await Job.findById(jobId)
    .populate('applications.applicant', 'profile.firstName profile.lastName profile.email');

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Check if user is the job poster
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to update applications for this job'));
  }

  const application = job.applications.id(applicationId);
  if (!application) {
    return next(createError(404, 'Application not found'));
  }

  // Update application
  application.status = status;
  if (notes) application.notes = notes;
  if (interviewDate) application.interviewScheduled = new Date(interviewDate);
  application.reviewedAt = new Date();
  application.reviewedBy = req.user._id;

  await job.save();

  // Create notification for applicant
  let notificationTitle, notificationMessage;
  switch (status) {
    case 'reviewed':
      notificationTitle = 'Application Under Review';
      notificationMessage = `Your application for ${job.title} is being reviewed`;
      break;
    case 'shortlisted':
      notificationTitle = 'Application Shortlisted';
      notificationMessage = `Great news! You've been shortlisted for ${job.title}`;
      break;
    case 'interview':
      notificationTitle = 'Interview Scheduled';
      notificationMessage = `Interview scheduled for ${job.title}`;
      break;
    case 'offered':
      notificationTitle = 'Job Offer';
      notificationMessage = `Congratulations! You have a job offer for ${job.title}`;
      break;
    case 'hired':
      notificationTitle = 'Congratulations!';
      notificationMessage = `You've been hired for ${job.title}`;
      break;
    case 'rejected':
      notificationTitle = 'Application Update';
      notificationMessage = `Thank you for your interest in ${job.title}`;
      break;
    default:
      notificationTitle = 'Application Update';
      notificationMessage = `Your application status for ${job.title} has been updated`;
  }

  await Notification.createNotification({
    recipient: application.applicant._id,
    sender: req.user._id,
    type: 'application_status',
    title: notificationTitle,
    message: notificationMessage,
    relatedJob: job._id,
    data: { 
      status, 
      notes, 
      interviewDate,
      jobTitle: job.title 
    }
  });

  successResponse(res, 200, 'Application status updated successfully', {
    application: {
      id: application._id,
      applicant: application.applicant,
      status: application.status,
      notes: application.notes,
      interviewScheduled: application.interviewScheduled,
      reviewedAt: application.reviewedAt
    }
  });
}));

/**
 * @route   POST /api/jobs/:id/save
 * @desc    Save/bookmark job
 * @access  Private
 */
router.post('/:id/save', authenticateToken, asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Add to user's saved jobs if not already saved
  const user = await User.findById(req.user._id);
  const isAlreadySaved = user.savedJobs.includes(req.params.id);

  if (isAlreadySaved) {
    return next(createError(400, 'Job already saved'));
  }

  user.savedJobs.push(req.params.id);
  await user.save();

  successResponse(res, 200, 'Job saved successfully');
}));

/**
 * @route   DELETE /api/jobs/:id/save
 * @desc    Remove saved job
 * @access  Private
 */
router.delete('/:id/save', authenticateToken, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  user.savedJobs = user.savedJobs.filter(
    jobId => jobId.toString() !== req.params.id
  );
  
  await user.save();

  successResponse(res, 200, 'Job removed from saved jobs');
}));

/**
 * @route   GET /api/jobs/saved
 * @desc    Get user's saved jobs
 * @access  Private
 */
router.get('/saved', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    populate: {
      path: 'postedBy',
      select: 'profile.firstName profile.lastName profile.profilePicture company'
    },
    options: {
      sort: { createdAt: -1 },
      skip,
      limit
    }
  });

  const totalSaved = user.savedJobs.length;
  const totalPages = Math.ceil(totalSaved / limit);

  successResponse(res, 200, 'Saved jobs retrieved successfully', {
    jobs: user.savedJobs,
    pagination: {
      currentPage: page,
      totalPages,
      totalSaved,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  });
}));

/**
 * @route   POST /api/jobs/:id/report
 * @desc    Report inappropriate job posting
 * @access  Private
 */
router.post('/:id/report', authenticateToken, asyncHandler(async (req, res, next) => {
  const { reason, details } = req.body;

  if (!reason) {
    return next(createError(400, 'Report reason is required'));
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Add report
  job.reports.push({
    reporter: req.user._id,
    reason,
    details: details || '',
    reportedAt: new Date()
  });

  await job.save();

  successResponse(res, 200, 'Job reported successfully');
}));

/**
 * @route   GET /api/jobs/analytics/:id
 * @desc    Get job analytics (job poster only)
 * @access  Private
 */
router.get('/analytics/:id', authenticateToken, asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate('analytics.viewHistory.viewer', 'profile.firstName profile.lastName profile.profilePicture')
    .populate('applications.applicant', 'profile.firstName profile.lastName profile.profilePicture profile.headline');

  if (!job) {
    return next(createError(404, 'Job not found'));
  }

  // Check if user is the job poster
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(createError(403, 'Not authorized to view analytics for this job'));
  }

  const analytics = {
    viewCount: job.analytics.viewCount,
    applicationCount: job.applicationCount,
    viewHistory: job.analytics.viewHistory.slice(-50), // Last 50 views
    applicationsByStatus: {
      pending: job.applications.filter(app => app.status === 'pending').length,
      reviewed: job.applications.filter(app => app.status === 'reviewed').length,
      shortlisted: job.applications.filter(app => app.status === 'shortlisted').length,
      interview: job.applications.filter(app => app.status === 'interview').length,
      offered: job.applications.filter(app => app.status === 'offered').length,
      hired: job.applications.filter(app => app.status === 'hired').length,
      rejected: job.applications.filter(app => app.status === 'rejected').length
    },
    recentApplications: job.applications
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .slice(0, 10)
  };

  successResponse(res, 200, 'Job analytics retrieved successfully', { analytics });
}));

module.exports = router;
