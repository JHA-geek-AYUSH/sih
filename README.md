# Pharmalytics Care - Rural Healthcare Management System

A comprehensive healthcare management system designed for rural areas, featuring AI-powered demand prediction, inventory management, and patient-pharmacy connectivity.

## 🏥 Features

- **🔐 Secure Authentication** - JWT-based authentication with role-based access control
- **💊 Medicine Management** - Complete CRUD operations for medicine catalog
- **📦 Smart Inventory** - Real-time stock tracking with low-stock alerts
- **🤖 AI Predictions** - Machine learning-powered demand forecasting
- **📱 SMS Notifications** - Automated alerts via Twilio integration
- **📊 Analytics Dashboard** - Comprehensive reporting for administrators
- **🔄 Reservation System** - Medicine booking and pickup management
- **🌐 Multi-role Interface** - Separate dashboards for patients, pharmacies, and admins

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Express Validator + Joi
- **SMS**: Twilio
- **Email**: Nodemailer
- **ML**: TensorFlow.js + Custom algorithms
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation

## 🚀 Quick Start

### Option 1: Docker (Recommended - Easiest Setup)

**Prerequisites:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Git

**One-Command Setup:**
```bash
# Clone and start everything with Docker
git clone https://github.com/JHA-geek-AYUSH/sih.git
cd sih

# For Windows
start-docker.bat

# For Linux/Mac
chmod +x start-docker.sh
./start-docker.sh
```

**Manual Docker Setup:**
```bash
# 1. Clone repository
git clone https://github.com/JHA-geek-AYUSH/sih.git
cd sih

# 2. Set up environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# 3. Start all services
docker-compose -f docker-compose.full.yml --profile dev up --build

# 4. Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000/api
```

📖 **Detailed Docker Guide:** See [DOCKER_SETUP.md](./DOCKER_SETUP.md)

### Option 2: Manual Setup

**Prerequisites:**
- Node.js 18+
- MongoDB 5.0+
- Redis (optional)
- Git

**Installation:**
```bash
# 1. Clone repository
git clone https://github.com/JHA-geek-AYUSH/sih.git
cd sih

# 2. Set up environment variables
# See SETUP.md for detailed configuration
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start backend
cd backend
npm install
npm run dev

# 4. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000/api
```

## 📁 Project Structure

```
pharmalytics-care-main/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── docker-compose.yml   # Docker configuration
│   └── package.json
├── frontend/                # React + TypeScript app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utility functions
│   └── package.json
├── .gitignore              # Git ignore rules
├── SETUP.md               # Detailed setup guide
└── README.md              # This file
```

## 👥 User Roles

### Patient
- Search and reserve medicines
- View nearby pharmacies
- Track reservation status
- Receive SMS notifications

### Pharmacy
- Manage inventory and stock levels
- Handle patient reservations
- View AI-powered demand predictions
- Update medicine availability

### Admin
- System-wide analytics and reporting
- User management
- ML model insights
- System monitoring

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev          # Start development server
npm test            # Run tests
npm run seed        # Seed database with sample data
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
```

## 🐳 Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
cd backend
docker-compose up -d
```

This will start:
- MongoDB database
- Redis cache
- Backend API server

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Environment variable protection

## 📊 API Documentation

The backend includes Swagger documentation available at:
- Development: http://localhost:5000/api-docs

## 🤖 Machine Learning Features

- Demand prediction using historical data
- Inventory optimization recommendations
- Trend analysis and forecasting
- Performance metrics tracking

## 📱 SMS Integration

- Automated low-stock alerts
- Reservation confirmations
- Pickup reminders
- Emergency notifications

## 🚨 Important Security Notes

⚠️ **Before deploying to production:**

1. Change all default passwords and secrets
2. Set up proper SSL certificates
3. Configure production CORS origins
4. Use environment-specific configurations
5. Set up proper logging and monitoring
6. Never commit `.env` files to version control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the [SETUP.md](./SETUP.md) for detailed setup instructions
- Review the individual README files in `backend/` and `frontend/` directories
- Open an issue for bugs or feature requests

## 🙏 Acknowledgments

- Built for rural healthcare improvement
- Designed with accessibility in mind
- Optimized for low-bandwidth environments



# 01-sep-2025