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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Routes - ORDER MATTERS!
// Routes - ORDER MATTERS!
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const productRoutes = require('./routes/productRoutes');
const scanRoutes = require('./routes/scanRoutes');

const { initializeAdmin } = require('./controllers/authController');

// Register routes in correct order
app.use('/api/auth', authRoutes);
app.use('/api', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scan', scanRoutes);

// Test management routes - Mounted at /api/tm to avoid conflict with adminRoutes middleware
console.log('Loading test management routes...');
try {
    const testManagementRoutes = require('./routes/testManagementRoutes');
    console.log('✅ Test management routes loaded successfully');
    app.use('/api/tm', testManagementRoutes);
    console.log('✅ Test management routes registered at /api/tm');
} catch (error) {
    console.error('❌ Error loading test management routes:', error.message);
    console.error(error.stack);
}

// Serve static files from uploads directory (for local testing)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Counterfeit Detector API is running');
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clear all analysis records (for testing)
app.delete('/api/clear-history', async (req, res) => {
    try {
        const Analysis = require('./models/Analysis');
        await Analysis.deleteMany({});
        res.json({ success: true, message: 'All analysis records cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear records', error: error.message });
    }
});

// Force set admin role for admin@veriscan.com
app.post('/api/force-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        const user = await User.findOne({ email: 'admin@veriscan.com' });

        if (user) {
            user.role = 'admin';
            await user.save();
            res.json({ success: true, message: 'Admin role set successfully', user: { email: user.email, role: user.role } });
        } else {
            res.json({ success: false, message: 'User not found in database' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('/(.*)', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeAdmin();
});
