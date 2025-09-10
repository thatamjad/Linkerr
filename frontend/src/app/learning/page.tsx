'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  Search,
  Filter,
  PlayCircle,
  Clock,
  Users,
  Star,
  TrendingUp,
  Award,
  Target,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  thumbnail?: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  studentsCount: number;
  price: number;
  isFree: boolean;
  category: string;
  skills: string[];
  progress?: number;
  isBookmarked?: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  category: string;
  progress?: number;
}

const CourseCard: React.FC<{ course: Course; onAction: (courseId: string, action: string) => void }> = ({ 
  course, 
  onAction 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      layout
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
        {/* Course Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <PlayCircle className="h-16 w-16 text-white opacity-80" />
          
          {course.isBookmarked && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 text-white hover:bg-white/20"
              onClick={() => onAction(course.id, 'bookmark')}
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </Button>
          )}
          
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-black/20 text-white border-0">
              {course.duration}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'}>
                {course.level}
              </Badge>
              
              <div className="flex items-center space-x-1 text-sm text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {course.description}
            </p>
          </div>
          
          {/* Instructor */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                {course.instructor.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {course.instructor}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {course.studentsCount.toLocaleString()} students
              </p>
            </div>
          </div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-4">
            {course.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {course.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.skills.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Progress (if enrolled) */}
          {course.progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              {course.isFree ? (
                <span className="text-green-600 font-bold">Free</span>
              ) : (
                <span className="font-bold text-gray-900 dark:text-white">
                  ${course.price}
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {course.progress !== undefined ? (
                <Button size="sm">
                  Continue Learning
                </Button>
              ) : (
                <Button size="sm" onClick={() => onAction(course.id, 'enroll')}>
                  {course.isFree ? 'Start Free' : 'Enroll Now'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LearningPathCard: React.FC<{ path: LearningPath }> = ({ path }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {path.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {path.description}
              </p>
            </div>
            
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{path.courses} courses</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{path.duration}</span>
            </div>
            
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              <span>{path.level}</span>
            </div>
          </div>
          
          {path.progress !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Progress</span>
                <span className="font-medium">{path.progress}%</span>
              </div>
              <Progress value={path.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Complete React Developer Course 2024',
      description: 'Master React with projects, hooks, Redux, and more. Build amazing web applications from scratch.',
      instructor: 'John Martinez',
      duration: '12h 30m',
      level: 'Intermediate',
      rating: 4.8,
      studentsCount: 45230,
      price: 89,
      isFree: false,
      category: 'Web Development',
      skills: ['React', 'JavaScript', 'Redux', 'Hooks'],
      isBookmarked: true
    },
    {
      id: '2',
      title: 'Python for Data Science and Machine Learning',
      description: 'Learn Python programming for data analysis, visualization, and machine learning applications.',
      instructor: 'Dr. Sarah Chen',
      duration: '18h 45m',
      level: 'Beginner',
      rating: 4.9,
      studentsCount: 67890,
      price: 0,
      isFree: true,
      category: 'Data Science',
      skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
      progress: 65
    },
    {
      id: '3',
      title: 'Advanced UI/UX Design Principles',
      description: 'Master advanced design principles, user psychology, and create stunning user experiences.',
      instructor: 'Emily Rodriguez',
      duration: '8h 20m',
      level: 'Advanced',
      rating: 4.7,
      studentsCount: 23450,
      price: 129,
      isFree: false,
      category: 'Design',
      skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping']
    }
  ]);

  const [learningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Full Stack Web Developer',
      description: 'Complete path from frontend to backend development with modern technologies.',
      courses: 8,
      duration: '6 months',
      level: 'Beginner to Advanced',
      category: 'Web Development',
      progress: 25
    },
    {
      id: '2',
      title: 'Data Science Professional',
      description: 'Master data analysis, machine learning, and statistical modeling.',
      courses: 12,
      duration: '8 months',
      level: 'Intermediate to Advanced',
      category: 'Data Science'
    },
    {
      id: '3',
      title: 'Product Manager Certification',
      description: 'Learn product strategy, roadmapping, and team leadership skills.',
      courses: 6,
      duration: '4 months',
      level: 'Beginner to Intermediate',
      category: 'Business'
    }
  ]);

  const handleCourseAction = async (courseId: string, action: string) => {
    try {
      console.log(`${action} action for course ${courseId}`);
      // Implement actual API calls here
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myCourses = courses.filter(course => course.progress !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Learning Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Advance your career with professional courses and learning paths
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Learning Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Courses Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Hours Learned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">148</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Skills Gained</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Streak Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              <TabsTrigger value="paths">Learning Paths</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard
                        course={course}
                        onAction={handleCourseAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredCourses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="my-courses" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {myCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard
                        course={course}
                        onAction={handleCourseAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {myCourses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No enrolled courses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start learning by enrolling in courses from the Discover tab
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="paths" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {learningPaths.map((path, index) => (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LearningPathCard path={path} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {courses.filter(course => course.isBookmarked).map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CourseCard
                        course={course}
                        onAction={handleCourseAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {!courses.some(course => course.isBookmarked) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bookmarked courses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Bookmark courses to save them for later
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
