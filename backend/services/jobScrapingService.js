const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const User = require('../models/User');
const { CronJob } = require('cron');

class JobScrapingService {
  constructor() {
    this.isInitialized = false;
    this.scrapingJobs = new Map();
  }

  // Initialize job scraping service
  async initialize() {
    if (this.isInitialized) return;

    console.log('🔍 Initializing Job Scraping Service...');

    // Schedule job scraping tasks (run every hour)
    if (process.env.ENABLE_JOB_SCRAPING === 'true') {
      const scrapingJob = new CronJob('0 * * * *', () => {
        this.runScrapingJob();
      }, null, true);
      
      console.log('✅ Job scraping scheduled to run every hour');
    }

    this.isInitialized = true;
  }

  // Main scraping job runner
  async runScrapingJob() {
    try {
      console.log('🔍 Starting job scraping...');

      const results = await Promise.allSettled([
        this.scrapeIndeedJobs(),
        this.scrapeLinkedInJobs(),
        this.scrapeGlassdoorJobs()
      ]);

      let totalJobs = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalJobs += result.value;
          console.log(`✅ Source ${index + 1} scraped: ${result.value} jobs`);
        } else {
          console.error(`❌ Source ${index + 1} failed:`, result.reason.message);
        }
      });

      console.log(`🎉 Job scraping completed. Total new jobs: ${totalJobs}`);
    } catch (error) {
      console.error('❌ Job scraping failed:', error);
    }
  }

  // Scrape Indeed jobs (simplified example)
  async scrapeIndeedJobs() {
    if (!process.env.INDEED_API_KEY) {
      console.log('⚠️ Indeed API key not configured, skipping Indeed scraping');
      return 0;
    }

    try {
      // This is a simplified example - actual implementation would use Indeed's API
      // For demonstration, we'll create mock jobs
      const mockJobs = this.generateMockJobs('Indeed', 5);
      let createdCount = 0;

      for (const jobData of mockJobs) {
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          'location.city': jobData.location.city
        });

        if (!existingJob) {
          const job = new Job(jobData);
          await job.save();
          createdCount++;
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Error scraping Indeed jobs:', error);
      return 0;
    }
  }

  // Scrape LinkedIn jobs (placeholder)
  async scrapeLinkedInJobs() {
    if (!process.env.LINKEDIN_API_KEY) {
      console.log('⚠️ LinkedIn API key not configured, skipping LinkedIn scraping');
      return 0;
    }

    try {
      // LinkedIn has strict API access - this would require proper OAuth and permissions
      const mockJobs = this.generateMockJobs('LinkedIn', 3);
      let createdCount = 0;

      for (const jobData of mockJobs) {
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          'location.city': jobData.location.city
        });

        if (!existingJob) {
          const job = new Job(jobData);
          await job.save();
          createdCount++;
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
      return 0;
    }
  }

  // Scrape Glassdoor jobs (placeholder)
  async scrapeGlassdoorJobs() {
    try {
      // Glassdoor scraping would require handling their anti-bot measures
      const mockJobs = this.generateMockJobs('Glassdoor', 2);
      let createdCount = 0;

      for (const jobData of mockJobs) {
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          'location.city': jobData.location.city
        });

        if (!existingJob) {
          const job = new Job(jobData);
          await job.save();
          createdCount++;
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Error scraping Glassdoor jobs:', error);
      return 0;
    }
  }

  // Generate mock jobs for demonstration (replace with actual scraping logic)
  generateMockJobs(source, count) {
    const jobTitles = [
      'Software Engineer',
      'Product Manager',
      'Data Scientist',
      'UI/UX Designer',
      'DevOps Engineer',
      'Marketing Manager',
      'Sales Representative',
      'Business Analyst',
      'Full Stack Developer',
      'Frontend Developer'
    ];

    const companies = [
      'TechCorp',
      'InnovateTech',
      'DataSystems Inc',
      'CloudSolutions',
      'StartupX',
      'BigTech Co',
      'DesignStudio',
      'AnalyticsPro',
      'WebDev LLC',
      'FutureSoft'
    ];

    const cities = [
      'San Francisco',
      'New York',
      'Seattle',
      'Austin',
      'Boston',
      'Los Angeles',
      'Chicago',
      'Denver',
      'Atlanta',
      'Miami'
    ];

    const mockJobs = [];

    for (let i = 0; i < count; i++) {
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      mockJobs.push({
        title: `${title} - ${source}`,
        description: `Exciting opportunity for a ${title} at ${company}. Join our dynamic team and work on cutting-edge projects.`,
        company: company,
        location: {
          city: city,
          state: 'CA', // Simplified
          country: 'USA',
          type: Math.random() > 0.5 ? 'onsite' : 'hybrid'
        },
        jobType: ['full-time', 'part-time', 'contract'][Math.floor(Math.random() * 3)],
        workArrangement: ['remote', 'hybrid', 'onsite'][Math.floor(Math.random() * 3)],
        experienceLevel: ['entry', 'mid', 'senior'][Math.floor(Math.random() * 3)],
        industry: 'Technology',
        salary: {
          min: 50000 + Math.floor(Math.random() * 100000),
          max: 80000 + Math.floor(Math.random() * 120000),
          currency: 'USD',
          period: 'yearly'
        },
        requirements: {
          skills: ['JavaScript', 'Python', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 4) + 1),
          education: 'Bachelor\'s degree preferred',
          experience: `${Math.floor(Math.random() * 5) + 1}+ years experience`
        },
        benefits: [
          'Health insurance',
          '401(k)',
          'Flexible hours',
          'Remote work options'
        ],
        applicationDeadline: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        status: 'active',
        source: source.toLowerCase(),
        externalUrl: `https://${source.toLowerCase()}.com/job/example-${i}`,
        isExternal: true,
        postedBy: null // External jobs don't have internal posters
      });
    }

    return mockJobs;
  }

  // Scrape a specific job posting URL
  async scrapeJobUrl(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Generic scraping logic - would need to be customized per site
      const jobData = {
        title: $('h1').first().text().trim(),
        company: $('.company-name, [data-testid="company-name"]').first().text().trim(),
        description: $('.job-description, .jobsearch-jobDescriptionText').text().trim(),
        location: $('.location, [data-testid="job-location"]').first().text().trim(),
        source: new URL(url).hostname,
        externalUrl: url,
        isExternal: true
      };

      return jobData;
    } catch (error) {
      console.error('Error scraping job URL:', error);
      throw error;
    }
  }

  // Clean up old external jobs
  async cleanupOldJobs() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Job.deleteMany({
        isExternal: true,
        status: { $in: ['expired', 'closed'] },
        createdAt: { $lt: thirtyDaysAgo }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old external jobs`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
      return 0;
    }
  }

  // Get job recommendations based on user profile
  async getPersonalizedJobs(userId, limit = 20) {
    try {
      const user = await User.findById(userId).select('profile');
      if (!user) return [];

      const userSkills = user.profile.skills || [];
      const userLocation = user.profile.location || '';
      const userIndustry = user.profile.industry || '';

      // Build matching query
      const query = {
        status: 'active',
        $or: [
          { 'requirements.skills': { $in: userSkills } },
          { industry: userIndustry },
          { 'location.city': { $regex: userLocation, $options: 'i' } }
        ]
      };

      const jobs = await Job.find(query)
        .populate('postedBy', 'profile.firstName profile.lastName profile.profilePicture company')
        .sort({ createdAt: -1, applicationCount: 1 }) // Prefer newer jobs with fewer applications
        .limit(limit)
        .lean();

      return jobs;
    } catch (error) {
      console.error('Error getting personalized jobs:', error);
      return [];
    }
  }

  // Manual trigger for scraping (for admin use)
  async triggerScraping() {
    if (this.scrapingJobs.has('manual')) {
      throw new Error('Manual scraping already in progress');
    }

    this.scrapingJobs.set('manual', { startTime: new Date(), status: 'running' });

    try {
      await this.runScrapingJob();
      this.scrapingJobs.set('manual', { 
        startTime: this.scrapingJobs.get('manual').startTime, 
        endTime: new Date(), 
        status: 'completed' 
      });
    } catch (error) {
      this.scrapingJobs.set('manual', { 
        startTime: this.scrapingJobs.get('manual').startTime, 
        endTime: new Date(), 
        status: 'failed',
        error: error.message 
      });
      throw error;
    }
  }

  // Get scraping status
  getScrapingStatus() {
    return {
      isInitialized: this.isInitialized,
      activeJobs: Array.from(this.scrapingJobs.entries()).map(([id, job]) => ({
        id,
        ...job
      })),
      nextScheduledRun: this.getNextScheduledRun()
    };
  }

  // Get next scheduled run time
  getNextScheduledRun() {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  }
}

// Create singleton instance
const jobScrapingService = new JobScrapingService();

const initializeJobScraping = async () => {
  try {
    await jobScrapingService.initialize();
  } catch (error) {
    console.error('Failed to initialize job scraping service:', error);
  }
};

module.exports = {
  initializeJobScraping,
  jobScrapingService
};
