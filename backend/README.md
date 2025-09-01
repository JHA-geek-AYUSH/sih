# Rural Healthcare Management System (RHMS) - Backend

A comprehensive Node.js + Express backend for managing rural healthcare pharmacy operations with AI-powered demand prediction.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 💊 **Medicine Management** - Complete CRUD operations for medicines
- 📦 **Inventory Tracking** - Real-time stock management with alerts
- 🤖 **ML Predictions** - AI-powered demand forecasting
- 📱 **SMS Notifications** - Automated alerts and confirmations
- 📊 **Analytics Dashboard** - Comprehensive reporting for admins
- 🔄 **Reservation System** - Medicine booking and pickup management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Express Validator
- **SMS**: Twilio
- **Email**: Nodemailer
- **ML**: TensorFlow.js + Custom algorithms
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Seed database (optional)**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Medicines
- `GET /api/medicines/search` - Search medicines
- `GET /api/medicines/:id` - Get medicine details
- `POST /api/medicines` - Create medicine (Admin)
- `PUT /api/medicines/:id` - Update medicine (Admin)
- `DELETE /api/medicines/:id` - Delete medicine (Admin)

### Pharmacy
- `GET /api/pharmacy/inventory` - Get inventory
- `POST /api/pharmacy/inventory` - Add to inventory
- `PUT /api/pharmacy/inventory/:id` - Update inventory
- `GET /api/pharmacy/stats` - Dashboard stats
- `GET /api/pharmacy/reservations` - Get reservations

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/my` - Get user reservations
- `GET /api/reservations/code/:code` - Get by code
- `PUT /api/reservations/:id/cancel` - Cancel reservation

### Admin
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/pharmacies` - Pharmacy data
- `GET /api/admin/demand-trends` - Demand trends
- `GET /api/admin/alerts` - System alerts
- `GET /api/admin/users` - User management

### ML Services
- `GET /api/ml/predictions` - Demand predictions
- `GET /api/ml/insights` - AI insights
- `GET /api/ml/forecast/:medicineId` - Medicine forecast
- `GET /api/ml/performance` - Model metrics

## User Roles

### Patient
- Search and reserve medicines
- View nearby pharmacies
- Track reservations

### Pharmacy
- Manage inventory
- Handle reservations
- View ML predictions
- Update stock levels

### Admin
- System oversight
- Analytics and reporting
- User management
- ML insights

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pharmalytics_care

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## Database Schema

### Users
- Authentication and profile data
- Role-based permissions
- Location information

### Medicines
- Medicine catalog
- Categories and dosage info
- Prescription requirements

### Inventory
- Stock levels per pharmacy
- Pricing and batch info
- Status tracking

### Reservations
- Patient bookings
- Pickup management
- Status workflow

## ML Features

- **Demand Prediction**: Forecasts medicine demand using historical data
- **Stock Optimization**: Recommends optimal stock levels
- **Anomaly Detection**: Identifies unusual demand patterns
- **Seasonal Analysis**: Recognizes seasonal trends

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## Monitoring

- Winston logging with file rotation
- Request/response logging
- Error tracking
- Performance monitoring

## Automated Tasks

- Expired reservation cleanup
- Low stock alerts
- Inventory status updates
- ML model retraining

## Development

```bash
# Development with auto-reload
npm run dev

# Run tests
npm test

# Seed database
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging
6. Configure backup strategies

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Support

For technical support or questions, contact the development team.
