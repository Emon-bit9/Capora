#!/bin/bash

echo "🚀 Setting up ContentCraft development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Setup backend
echo "🐍 Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate || source venv/Scripts/activate
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis
if [ $? -eq 0 ]; then
    echo "✅ Docker services started"
else
    echo "❌ Failed to start Docker services"
    exit 1
fi

echo ""
echo "🎉 Setup complete! To start development:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate  # or 'source venv/Scripts/activate' on Windows"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "📚 Visit http://localhost:3000 for frontend"
echo "📚 Visit http://localhost:8000/docs for API documentation"
echo "📚 Visit http://localhost:5050 for database admin (docker-compose --profile tools up -d)" 