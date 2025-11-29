const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Restrict in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
        : '*',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`ðŸ“¥ ${req.method} ${req.path}`);
        next();
    });
}

// Connect to MongoDB
connectDB();

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const referencesDir = path.join(__dirname, 'uploads', 'references');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(referencesDir)) {
    fs.mkdirSync(referencesDir, { recursive: true });
}

// Routes - ORDER MATTERS!
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const productRoutes = require('./routes/productRoutes');
const scanRoutes = require('./routes/scanRoutes');
const referenceRoutes = require('./routes/referenceRoutes');

const { initializeAdmin } = require('./controllers/authController');

// Register routes in correct order
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/references', referenceRoutes);

// Test management routes - Mounted at /api/tm to avoid conflict with adminRoutes middleware
if (process.env.NODE_ENV !== 'production') {
    console.log('Loading test management routes...');
    try {
        const testManagementRoutes = require('./routes/testManagementRoutes');
        console.log('âœ… Test management routes loaded successfully');
        app.use('/api/tm', testManagementRoutes);
        console.log('âœ… Test management routes registered at /api/tm');
    } catch (error) {
        console.error('âŒ Error loading test management routes:', error.message);
    }
}

// Serve static files from uploads directory (PROTECTED - requires authentication)
const { verifyToken } = require('./middleware/authMiddleware');
app.use('/uploads', verifyToken, express.static(path.join(__dirname, 'uploads')));

// Basic Route (Dev only)
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req, res) => {
        res.send('Counterfeit Detector API is running');
    });
}

// Health Check (Public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REMOVED DANGEROUS ENDPOINTS:
// - /api/clear-history (unprotected data deletion)
// - /api/force-admin (unprotected admin escalation)
// These should NEVER be accessible in production!

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeAdmin();
});
