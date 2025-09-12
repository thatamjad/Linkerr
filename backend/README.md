# Linkerr - Professional Networking Platform (Backend)

A comprehensive Node.js backend for Linkerr, a professional networking social media platform built with the MERN stack.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with refresh tokens
- **User Profiles** - Rich professional profiles with skills, experience, education
- **Posts & Feed** - Create, share, like, comment on professional content
- **Professional Networking** - Send/accept connection requests, build professional network
- **Job Board** - Post jobs, apply to positions, track applications
- **Real-time Features** - Live notifications, online status, typing indicators
- **Advanced Search** - Search users, posts, jobs with filters and suggestions
- **File Uploads** - Profile pictures, cover photos, post media
- **Admin Panel** - User management, content moderation, analytics

### Technical Features
- **RESTful API** - Comprehensive REST endpoints
- **Real-time Communication** - Socket.IO for live features
- **Database** - MongoDB with Mongoose ODM
- **Caching** - Redis for sessions and performance
- **Job Scraping** - Automated job collection from external sources
- **Security** - Helmet, CORS, rate limiting, input validation
- **Error Handling** - Centralized error management
- **Logging** - Request logging with Morgan
- **File Uploads** - Multer for handling media uploads

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start the services**
   ```bash
   # Start MongoDB (if not using MongoDB Atlas)
   mongod
   
   # Start Redis
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/social-media-platform
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-session-secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Job Scraping (Optional)
ENABLE_JOB_SCRAPING=false
INDEED_API_KEY=
LINKEDIN_API_KEY=
```

## 📁 Project Structure

```
backend/
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   ├── notFound.js     # 404 handler
│   └── validation.js   # Input validation
├── models/             # Mongoose models
│   ├── User.js         # User model
│   ├── Post.js         # Post model
│   ├── Connection.js   # Connection model
│   ├── Job.js          # Job model
│   └── Notification.js # Notification model
├── routes/             # Express routes
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── posts.js        # Post-related routes
│   ├── connections.js  # Network/connection routes
│   ├── jobs.js         # Job board routes
│   ├── search.js       # Search functionality
│   ├── notifications.js # Notification routes
│   └── admin.js        # Admin panel routes
├── services/           # Business logic services
│   └── jobScrapingService.js # Job scraping automation
├── socket/             # Socket.IO configuration
│   └── socketHandler.js # Socket initialization
├── sockets/            # Socket event handlers
│   └── socketHandlers.js # Real-time event handling
├── utils/              # Utility functions
│   ├── auth.js         # Authentication utilities
│   └── error.js        # Error utilities
├── uploads/            # File upload directory
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── server.js          # Application entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload profile picture
- `POST /api/users/cover` - Upload cover photo
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts/feed` - Get user's feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Comment on post
- `POST /api/posts/:id/share` - Share post

### Connections
- `GET /api/connections` - Get user's connections
- `POST /api/connections/connect/:userId` - Send connection request
- `POST /api/connections/accept/:requestId` - Accept connection
- `POST /api/connections/decline/:requestId` - Decline connection
- `GET /api/connections/suggestions` - Get connection suggestions

### Jobs
- `GET /api/jobs` - Get job listings
- `POST /api/jobs` - Post a new job
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/applications` - Get user's applications
- `GET /api/jobs/recommendations` - Get personalized job recommendations

### Search
- `GET /api/search/global` - Global search
- `GET /api/search/users` - Search users
- `GET /api/search/posts` - Search posts
- `GET /api/search/jobs` - Search jobs
- `GET /api/search/suggestions` - Get search suggestions

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔄 Real-time Features (Socket.IO)

The application includes real-time features using Socket.IO:

- **Online Status** - See who's online in your network
- **Live Notifications** - Real-time notification delivery
- **Typing Indicators** - See when someone is typing
- **Live Feed Updates** - Real-time post interactions
- **Connection Status** - Live connection request updates

### Socket Events

#### Client → Server
- `join_room` - Join a specific room (post, job, conversation)
- `leave_room` - Leave a room
- `typing_start/stop` - Typing indicators
- `mark_notification_read` - Mark notification as read
- `update_status` - Change online status

#### Server → Client
- `new_notification` - Receive new notification
- `connection_status_update` - Connection status changes
- `post_interaction` - Live post likes/comments
- `user_typing` - Typing indicators
- `message_received` - Direct messages

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 Performance & Scalability

- **Database Indexing** - Optimized MongoDB indexes
- **Redis Caching** - Session storage and caching layer  
- **File Upload Optimization** - Multer with size limits
- **Rate Limiting** - API rate limiting for security
- **Compression** - Response compression middleware
- **Error Handling** - Comprehensive error management

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Express-validator for all inputs
- **Rate Limiting** - Request rate limiting
- **CORS Configuration** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Password Hashing** - bcrypt for password security
- **SQL Injection Prevention** - Mongoose ODM protection
- **XSS Protection** - Input sanitization

## 🚀 Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database URLs
   - Set secure JWT secrets

2. **Database Migration**
   ```bash
   # Ensure database is accessible
   # Run any necessary migrations
   ```

3. **Build & Start**
   ```bash
   npm run build  # if you have a build step
   npm start
   ```

4. **Process Management** (Optional)
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "social-media-backend"
   ```

## 📈 Monitoring & Logging

- **Request Logging** - Morgan HTTP request logger
- **Error Logging** - Comprehensive error tracking
- **Health Checks** - `/health` endpoint for monitoring
- **Admin Analytics** - Built-in admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🔄 API Documentation

For detailed API documentation, visit `/api-docs` when running the server (if Swagger is configured) or refer to the individual route files in the `/routes` directory.
