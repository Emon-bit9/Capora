@echo off
echo 🚀 Setting up ContentCraft development environment...

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

:: Copy environment file
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
) else (
    echo ⚠️  .env file already exists, skipping...
)

:: Setup frontend
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
)
cd ..

:: Setup backend
echo 🐍 Installing backend dependencies...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Backend dependencies installed
)
cd ..

:: Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    pause
    exit /b 1
) else (
    echo ✅ Docker services started
)

echo.
echo 🎉 Setup complete! To start development:
echo.
echo Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo 📚 Visit http://localhost:3000 for frontend
echo 📚 Visit http://localhost:8000/docs for API documentation
echo 📚 Visit http://localhost:5050 for database admin (docker-compose --profile tools up -d)
pause 