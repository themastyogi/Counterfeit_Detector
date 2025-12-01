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
const testRuleRoutes = require('./routes/testRuleRoutes');
const { initializeAdmin } = require('./controllers/authController');

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/test-rules', testRuleRoutes);

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
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Initialize admin account
    initializeAdmin();

    // Enable reference_comparison for Standard plan (auto-migration)
    try {
        const Plan = require('./models/Plan');
        const result = await Plan.updateOne(
            { name: /^standard$/i },
            { $set: { 'features.reference_comparison': true } }
        );
        if (result.modifiedCount > 0) {
            console.log('✅ Enabled reference_comparison for Standard plan');
        }
    } catch (error) {
        console.error('⚠️  Could not enable reference feature:', error.message);
    }

    // Fix users without tenant_id (auto-migration)
    try {
        const User = require('./models/User');
        const Tenant = require('./models/Tenant');
        const TenantPlan = require('./models/TenantPlan');
        const ProductMaster = require('./models/ProductMaster');
        const Plan = require('./models/Plan');

        const usersWithoutTenant = await User.find({
            tenant_id: { $exists: false },
            role: { $ne: 'system_admin' }
        });

        if (usersWithoutTenant.length > 0) {
            console.log(`🔧 Fixing ${usersWithoutTenant.length} users without tenant...`);

            for (const user of usersWithoutTenant) {
                // Create tenant
                const code = (user.fullName.substring(0, 3) + Math.floor(Math.random() * 1000)).toUpperCase();
                const newTenant = new Tenant({
                    name: `${user.fullName}'s Organization`,
                    code: code,
                    domain: user.email.split('@')[1] || 'veriscan.com',
                    plan: 'Standard',
                    status: 'ACTIVE'
                });
                await newTenant.save();

                // Assign tenant to user
                user.tenant_id = newTenant._id;
                if (user.role === 'user') {
                    user.role = 'tenant_admin';
                }
                await user.save();

                // Create TenantPlan
                const standardPlan = await Plan.findOne({ name: /^standard$/i });
                if (standardPlan) {
                    const tenantPlan = new TenantPlan({
                        tenant_id: newTenant._id,
                        plan_id: standardPlan._id,
                        start_date: new Date(),
                        end_date: null
                    });
                    await tenantPlan.save();
                }

                // Create sample products
                const sampleProducts = [
                    { tenant_id: newTenant._id, product_name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', sku: `APPL-IPH15P-${Math.floor(Math.random() * 1000)}` },
                    { tenant_id: newTenant._id, product_name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones', sku: `SMSG-S24-${Math.floor(Math.random() * 1000)}` },
                    { tenant_id: newTenant._id, product_name: 'Books', brand: 'Generic', category: 'Books', sku: `BOOK-${Math.floor(Math.random() * 1000)}` }
                ];
                await ProductMaster.insertMany(sampleProducts);

                console.log(`✅ Fixed user: ${user.email}`);
            }
        }
    } catch (error) {
        console.error('⚠️  Could not fix users without tenant:', error.message);
    }
});
