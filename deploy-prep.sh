#!/bin/bash

# Deployment preparation script for Linkerr Platform

echo "🚀 Preparing Linkerr Platform for deployment..."

# Check if we're in the right directory
if [ ! -f "project-charter.md" ]; then
    echo "❌ Please run this script from the root directory of the project"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

cd ..

echo "🔧 Building frontend for production..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo "✅ Project prepared successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Configure OAuth applications (Google, LinkedIn)"
echo "3. Deploy backend to Vercel (separate project)"
echo "4. Deploy frontend to Vercel (separate project)"
echo "5. Update environment variables in both projects"
echo "6. Update OAuth redirect URIs with deployment URLs"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
