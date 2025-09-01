# Pharmalytics Care - Setup Guide

This guide will help you set up the Pharmalytics Care project for development and production.

## Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis (optional, for caching)
- Git

## Environment Variables Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/pharmalytics_care

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Pharmalytics Care
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pharmalytics-care-main
   ```

2. **Set up environment variables**
   - Copy the environment variables from above into `.env` files
   - Update the values with your actual credentials

3. **Start with Docker Compose**
   ```bash
   cd backend
   docker-compose up -d
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Option 2: Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your configuration
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file with your configuration
   npm run dev
   ```

3. **Database Setup**
   - Start MongoDB locally
   - Run the seed script: `npm run seed` (in backend directory)

## Important Security Notes

⚠️ **Before pushing to GitHub:**

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Change default passwords** in `docker-compose.yml`:
   - `MONGO_INITDB_ROOT_PASSWORD`
   - `JWT_SECRET`
3. **Use strong, unique secrets** for production
4. **Set up proper CORS origins** for production

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set up proper SSL certificates
4. Configure production CORS origins
5. Use environment-specific secrets
6. Set up proper logging and monitoring

## API Endpoints

- Backend API: `http://localhost:5000/api`
- Frontend: `http://localhost:8080`
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`

## Troubleshooting

- Make sure MongoDB is running before starting the backend
- Check that all environment variables are set correctly
- Ensure ports 5000 and 8080 are available
- Check the logs in the `backend/logs/` directory for errors

## Support

For issues and questions, please check the individual README files in the `backend/` and `frontend/` directories.
