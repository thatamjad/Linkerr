'use client';

// Force dynamic rendering to avoid pre-rendering errors with React Query
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Share2,
  ExternalLink,
  Briefcase,
  Building2
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobSearch, useJobRecommendations } from '@/hooks/api';
import { formatDate, cn } from '@/lib/utils';
import type { Job } from '@/types';

const jobTypeColors = {
  'full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'freelance': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'internship': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

const JobCard: React.FC<{ job: Job; onSave: (jobId: string) => void; onApply: (jobId: string) => void }> = ({
  job,
  onSave,
  onApply
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(job.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {job.company.name}
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.company.location}
                </div>
                {job.salary && (
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}` : 'Salary not specified'}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(job.postedAt)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge 
                  variant="secondary" 
                  className={cn('px-3 py-1', jobTypeColors[job.type as keyof typeof jobTypeColors] || 'bg-gray-100')}
                >
                  {job.type}
                </Badge>
                {job.tags?.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.tags && job.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={cn(
                  'w-10 h-10 p-0',
                  isSaved ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button
              onClick={() => onApply(job.id)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    salaryMin: '',
    remote: false,
  });

  const { data: jobs, isLoading: jobsLoading } = useJobSearch(
    searchQuery,
    location,
    filters.type,
    undefined, // experience
    1,
    true
  );

  const { data: recommendations, isLoading: recommendationsLoading } = useJobRecommendations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will be triggered automatically by the query
  };

  const handleSaveJob = (jobId: string) => {
    // TODO: Implement save job
    console.log('Save job:', jobId);
  };

  const handleApplyJob = (jobId: string) => {
    // TODO: Implement apply for job
    console.log('Apply for job:', jobId);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover opportunities that match your skills and interests
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Search Jobs
                    </Button>
                    <Button type="button" variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Job Listings */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {jobs?.pagination?.total || 0} Jobs Found
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border rounded-md px-3 py-1 bg-white dark:bg-gray-800">
                    <option>Most Recent</option>
                    <option>Most Relevant</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                </div>
              </div>

              {jobsLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs?.items && jobs.items.length > 0 ? (
                <div className="space-y-6">
                  {jobs.items.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSaveJob}
                      onApply={handleApplyJob}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your search criteria or browse recommended jobs
                    </p>
                    <Button variant="outline">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Job Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended for You</CardTitle>
                  <CardDescription>
                    Jobs that match your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendationsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : recommendations?.items && recommendations.items.length > 0 ? (
                    <div className="space-y-4">
                      {recommendations.items.slice(0, 5).map((job) => (
                        <div key={job.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {job.company.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {job.type}
                            </Badge>
                            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No recommendations available
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Job Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full text-sm border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Minimum Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remote"
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remote" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remote only
                  </label>
                </div>

                <Button variant="outline" className="w-full text-sm">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            {/* Career Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Career Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Resume Builder
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Interview Tips
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Salary Guide
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Career Advice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
