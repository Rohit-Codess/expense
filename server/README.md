# PocketLedger Server - Backend API

A robust Node.js backend API for the PocketLedger expense tracking application with JWT authentication, MongoDB integration, and Twilio OTP verification.

## 🚀 Features

- **📱 OTP Authentication** - Phone number-based login with Twilio SMS verification
- **🔐 JWT Security** - Secure token-based authentication with protected routes
- **👤 User-Specific Data** - All expenses and categories are scoped to authenticated users
- **📊 CRUD Operations** - Complete Create, Read, Update, Delete for expenses and categories
- **📸 File Uploads** - Receipt photo upload support with Multer
- **📈 Analytics** - Expense statistics and monthly summaries
- **🏗️ MVC Architecture** - Clean separation of concerns with Models, Views, Controllers
- **✅ Input Validation** - Comprehensive request validation and error handling
- **🚦 CORS Support** - Configured for frontend integration

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **SMS Service**: Twilio for OTP verification
- **File Upload**: Multer for receipt photos
- **Validation**: Mongoose schema validation
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   └── database.ts      # MongoDB connection setup
├── controllers/         # Request handlers (business logic)
│   ├── authController.ts    # Authentication (OTP, JWT)
│   ├── categoryController.ts # Category CRUD operations
│   └── expenseController.ts  # Expense CRUD operations
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT authentication middleware
│   └── errorHandler.ts  # Global error handling
├── models/             # MongoDB schemas
│   ├── User.ts         # User schema with OTP fields
│   ├── Category.ts     # Category schema (user-specific)
│   ├── Expense.ts      # Expense schema with receipt support
│   └── index.ts        # Model exports
├── routes/             # API route definitions
│   ├── auth.ts         # Authentication routes
│   ├── categories.ts   # Category routes (protected)
│   ├── expenses.ts     # Expense routes (protected)
│   └── index.ts        # Route aggregation
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
├── utils/              # Utility functions
└── server.ts           # Express app configuration
```

## 🔧 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Twilio Account** (for SMS OTP functionality)

### 1. Clone & Install

```bash
cd expense-tracker/server
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
MONGO_URI=mongodb://localhost:27017/pocketledger
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/pocketledger

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Twilio Configuration (get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Database Setup

**Local MongoDB:**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**MongoDB Atlas:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `MONGO_URI` in `.env`

### 4. Twilio Setup

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID, Auth Token, and Phone Number
3. Update Twilio credentials in `.env`

### 5. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Flow

#### 1. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "***-***-7890"
  }
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f123456789abc123456789",
      "phoneNumber": "+1234567890",
      "isVerified": true,
      "createdAt": "2024-09-13T10:30:00.000Z"
    }
  }
}
```

### Protected Routes

All subsequent API calls require the JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Categories API

#### Get All Categories
```http
GET /api/categories
```

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Food",
  "color": "#10B981",
  "icon": "🍽️"
}
```

#### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Dining",
  "color": "#059669"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
```

### Expenses API

#### Get Expenses (with filtering)
```http
GET /api/expenses?page=1&limit=10&category=64f123&startDate=2024-09-01&endDate=2024-09-30
```

#### Create Expense
```http
POST /api/expenses
Content-Type: multipart/form-data

{
  "title": "Coffee",
  "amount": 4.50,
  "categoryId": "64f123456789abc123456789",
  "date": "2024-09-13",
  "notes": "Morning coffee",
  "receipt": [file]
}
```

#### Update Expense
```http
PUT /api/expenses/:id
Content-Type: application/json

{
  "title": "Lunch",
  "amount": 12.50
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
```

#### Get Expense Statistics
```http
GET /api/expenses/stats?period=month
```

## 🏗️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String (unique, required),
  otp: String (temporary),
  otpExpiry: Date,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  color: String (hex color, required),
  icon: String (optional),
  userId: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  amount: Number (required, positive),
  categoryId: ObjectId (ref: Category, required),
  date: Date (required),
  notes: String (optional),
  receiptUrl: String (optional),
  userId: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with expiration
- **User Data Isolation**: All queries filtered by authenticated user ID
- **Input Validation**: Mongoose schema validation + custom validators
- **Error Handling**: Comprehensive error responses without sensitive data exposure
- **CORS Configuration**: Restricted to specified frontend origins
- **File Upload Security**: File type and size restrictions

## 📈 Performance Features

- **Database Indexing**: Optimized queries with compound indexes
- **Pagination**: Built-in pagination for large datasets
- **Aggregation**: Efficient statistics calculation using MongoDB aggregation
- **Connection Pooling**: MongoDB connection optimization

## 🚀 Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production start
npm start

# Development start with ts-node
npm run start:dev

# Clean build directory
npm run clean
```

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Development

### Adding New Endpoints

1. **Create Controller** in `src/controllers/`
2. **Add Routes** in `src/routes/`
3. **Update Models** if needed in `src/models/`
4. **Add Types** in `src/types/index.ts`

### Testing with Postman

Import the API collection:
1. Create new Postman collection
2. Set base URL: `http://localhost:3000/api`
3. Add Authorization header: `Bearer {{token}}`
4. Test authentication flow first
5. Use returned token for protected endpoints

## 📦 Production Deployment

### Environment Variables

Ensure these are set in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production MongoDB URI
- Valid Twilio credentials
- Appropriate `CORS_ORIGIN`

### Build & Deploy

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY uploads ./uploads
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include error logs and environment details

---

**Happy Coding! 🚀**