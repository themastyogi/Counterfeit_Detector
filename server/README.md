# Counterfeit Detector - Backend Server

Express.js backend for the Counterfeit Detector application with Cloud Vision API integration and MongoDB support.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required variables:
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)

Optional variables:
- `MONGODB_URI` - MongoDB connection string (app works without it)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account key

### 3. Google Cloud Vision API (Optional)

To use real Cloud Vision API instead of mock data:

1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com/)
2. Enable the Cloud Vision API
3. Create a service account and download the JSON key
4. Place the key file in the server directory as `google-cloud-key.json`
5. The path is already configured in `.env.example`

**Security Note:** The `google-cloud-key.json` file is in `.gitignore` and will never be committed to Git.

### 4. MongoDB (Optional)

The app works without MongoDB using in-memory storage. To enable persistence:

**Option 1: Local MongoDB**
```bash
# Install MongoDB and start the service
mongod
```

**Option 2: MongoDB Atlas**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

### 5. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Default Admin Account

On first run, a default admin account is created:
- Email: `admin@veriscan.com`
- Password: `Admin@123`

**⚠️ Change this password immediately in production!**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Analysis
- `POST /api/analyze` - Upload and analyze image
- `GET /api/history` - Get analysis history
- `GET /api/analysis/:id` - Get specific analysis

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/stats` - Get system statistics

## Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Environment variables for secrets
- ✅ `.gitignore` protects sensitive files
- ✅ CORS enabled for frontend

**Never commit:**
- `.env` file
- `google-cloud-key.json`
- Any `*.pem` or `*.key` files

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── analysisController.js  # Image analysis
│   └── adminController.js # Admin operations
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── uploadMiddleware.js # File upload handling
├── models/
│   ├── User.js           # User schema
│   └── Analysis.js       # Analysis schema
├── routes/
│   ├── authRoutes.js     # Auth endpoints
│   ├── analysisRoutes.js # Analysis endpoints
│   └── adminRoutes.js    # Admin endpoints
├── services/
│   └── visionService.js  # Cloud Vision API
├── uploads/              # Uploaded images
├── .env                  # Environment variables (not in Git)
├── .env.example          # Template for .env
├── .gitignore            # Git ignore rules
├── index.js              # Server entry point
└── package.json          # Dependencies
```

## License

MIT
