#!/bin/bash

# Pharmalytics Care - Docker Startup Script

echo "🏥 Starting Pharmalytics Care with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration before continuing."
    echo "Press Enter when ready..."
    read
fi

# Choose deployment mode
echo "Choose deployment mode:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🚀 Starting in Development mode..."
        docker-compose -f docker-compose.full.yml --profile dev up --build
        ;;
    2)
        echo "🚀 Starting in Production mode..."
        docker-compose -f docker-compose.full.yml --profile prod up --build
        ;;
    *)
        echo "❌ Invalid choice. Starting in Development mode..."
        docker-compose -f docker-compose.full.yml --profile dev up --build
        ;;
esac

echo "✅ Pharmalytics Care is starting up!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:5000/api"
echo "📊 MongoDB: mongodb://localhost:27017"
echo "🔄 Redis: redis://localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.full.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.full.yml down"
echo "  Restart: docker-compose -f docker-compose.full.yml restart"
