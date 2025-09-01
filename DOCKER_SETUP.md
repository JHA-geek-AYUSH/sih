# Docker Setup Guide - Pharmalytics Care

This guide will help you set up and run the Pharmalytics Care project using Docker.

## 🐳 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (to clone the repository)

## 🚀 Quick Start (Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/JHA-geek-AYUSH/sih.git
cd sih
```

### 2. Set Up Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (for local MongoDB)
MONGODB_URI=mongodb://admin:your_secure_password@mongodb:27017/pharmalytics_care?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://redis:6379

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### 3. Start with Docker Compose
```bash
# Start all services (MongoDB, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Start Frontend (Separate Terminal)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## 📋 Available Services

### Backend Services
- **API Server**: Node.js + Express on port 5000
- **MongoDB**: Database on port 27017
- **Redis**: Cache on port 6379

### Frontend
- **React App**: Vite development server on port 8080

## 🔧 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service_name]

# Check service status
docker-compose ps
```

### Development Commands
```bash
# Rebuild and start
docker-compose up --build

# Start specific service
docker-compose up -d backend

# Execute commands in container
docker-compose exec backend npm run seed
docker-compose exec mongodb mongo
```

### Database Operations
```bash
# Seed the database
docker-compose exec backend npm run seed

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p your_secure_password

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:your_secure_password@localhost:27017/pharmalytics_care?authSource=admin"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -an | findstr :5000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Backend Build Failures**
   ```bash
   # Rebuild without cache
   docker-compose build --no-cache backend
   
   # Check build logs
   docker-compose logs backend
   ```

4. **Permission Issues (Linux/Mac)**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## 🔒 Security Notes

### For Production
1. **Change Default Passwords**:
   - Update `MONGO_ROOT_PASSWORD` in `.env`
   - Use strong `JWT_SECRET`
   - Set secure `EMAIL_PASS`

2. **Environment Variables**:
   - Never commit `.env` files
   - Use Docker secrets for sensitive data
   - Set `NODE_ENV=production`

3. **Network Security**:
   - Use Docker networks for service communication
   - Expose only necessary ports
   - Configure proper CORS origins

## 📊 Monitoring

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## 🚀 Production Deployment

### Using Docker Compose
1. Set `NODE_ENV=production` in `.env`
2. Use production MongoDB instance
3. Configure proper SSL certificates
4. Set up reverse proxy (nginx)
5. Use Docker secrets for sensitive data

### Example Production Override
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  backend:
    environment:
      NODE_ENV: production
      MONGODB_URI: ${PROD_MONGODB_URI}
    restart: always
    
  mongodb:
    # Use external MongoDB in production
    image: mongo:7.0
    profiles: ["dev"]  # Only run in development
```

Start with: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure ports are available
4. Check Docker Desktop is running
5. Review the troubleshooting section above

## 🎯 Quick Commands Summary

```bash
# Complete setup
git clone https://github.com/JHA-geek-AYUSH/sih.git
cd sih/backend
cp .env.example .env
# Edit .env with your settings
docker-compose up -d
cd ../frontend
npm install
npm run dev

# Daily development
docker-compose up -d
docker-compose logs -f

# Reset everything
docker-compose down -v
docker-compose up --build
```
