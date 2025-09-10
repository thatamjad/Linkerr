@echo off
echo 🚀 Preparing Linkerr Platform for deployment...

:: Check if we're in the right directory
if not exist "project-charter.md" (
    echo ❌ Please run this script from the root directory of the project
    exit /b 1
)

echo 📦 Installing dependencies...

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    exit /b 1
)

:: Install backend dependencies
echo Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    exit /b 1
)

cd ..

echo 🔧 Building frontend for production...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

cd ..

echo ✅ Project prepared successfully!
echo.
echo 📋 Next steps:
echo 1. Set up MongoDB Atlas database
echo 2. Configure OAuth applications (Google, LinkedIn)
echo 3. Deploy backend to Vercel (separate project)
echo 4. Deploy frontend to Vercel (separate project)
echo 5. Update environment variables in both projects
echo 6. Update OAuth redirect URIs with deployment URLs
echo.
echo 📖 See DEPLOYMENT_GUIDE.md for detailed instructions

pause
