const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const ProductMaster = require('../models/ProductMaster');

// Initialize default system admin account
const initializeAdmin = async () => {
    try {
        const adminEmail = 'admin@veriscan.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);

            const adminUser = new User({
                fullName: 'System Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'system_admin',
                status: 'ACTIVE'
            });

            await adminUser.save();
            console.log('✅ Default system admin account created: admin@veriscan.com / Admin@123');
        }
    } catch (error) {
        console.log('⚠️  Could not create admin account (database may not be connected)');
    }
};

const register = async (req, res) => {
    try {
        const { fullName, email, password, tenant_id } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            tenant_id: tenant_id || null // Optional tenant association
        });

        await newUser.save();

        // Create token
        const token = jwt.sign({
            id: newUser._id,
            role: newUser.role,
            tenant_id: newUser.tenant_id
        }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                tenant_id: newUser.tenant_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Force system_admin role for admin@veriscan.com
        let userRole = user.role;
        if (email === 'admin@veriscan.com') {
            userRole = 'system_admin';
            if (user.role !== 'system_admin') {
                user.role = 'system_admin';
                await user.save();
            }
        }

        // Create token
        const token = jwt.sign({
            id: user._id,
            role: userRole,
            tenant_id: user.tenant_id
        }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // Fetch plan features if user belongs to a tenant
        let features = {};
        if (user.tenant_id) {
            const tenant = await Tenant.findById(user.tenant_id);
            if (tenant) {
                const plan = await Plan.findOne({ name: tenant.plan });
                if (plan && plan.features) {
                    features = plan.features;
                }
            }
        }

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: userRole,
                tenant_id: user.tenant_id,
                features
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send password reset email via SendGrid
        const { sendPasswordResetEmail } = require('../services/emailService');
        const emailResult = await sendPasswordResetEmail(user.email, resetToken);

        if (emailResult.success) {
            res.json({
                message: 'Password reset email sent. Please check your inbox.'
            });
        } else {
            res.status(500).json({
                message: 'Failed to send reset email. Please try again later.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const fixRole = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Promote to tenant_admin ONLY if not already system_admin
        if (user.role !== 'system_admin') {
            user.role = 'tenant_admin';
        }

        // If no tenant exists, create a default one
        if (!user.tenant_id) {
            // Generate a simple code from name or random
            const code = (user.fullName.substring(0, 3) + Math.floor(Math.random() * 1000)).toUpperCase();

            const newTenant = new Tenant({
                name: `${user.fullName}'s Organization`,
                code: code,
                domain: user.email.split('@')[1] || 'veriscan.com',
                plan: 'Standard',
                status: 'ACTIVE'
            });
            await newTenant.save();
            user.tenant_id = newTenant._id;
        }

        await user.save();

        // Create TenantPlan if it doesn't exist
        const TenantPlan = require('../models/TenantPlan');
        const existingTenantPlan = await TenantPlan.findOne({ tenant_id: user.tenant_id });

        if (!existingTenantPlan) {
            const standardPlan = await Plan.findOne({ name: /^standard$/i });
            if (standardPlan) {
                const tenantPlan = new TenantPlan({
                    tenant_id: user.tenant_id,
                    plan_id: standardPlan._id,
                    start_date: new Date(),
                    end_date: null // No expiry
                });
                await tenantPlan.save();
                console.log('✅ Created TenantPlan for tenant');
            }
        }

        // Check if tenant has products, if not seed them
        const productCount = await ProductMaster.countDocuments({ tenant_id: user.tenant_id });
        if (productCount === 0) {
            const sampleProducts = [
                { tenant_id: user.tenant_id, product_name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', sku: `APPL-IPH15P-${Math.floor(Math.random() * 1000)}` },
                { tenant_id: user.tenant_id, product_name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones', sku: `SMSG-S24-${Math.floor(Math.random() * 1000)}` },
                { tenant_id: user.tenant_id, product_name: 'Nike Air Jordan', brand: 'Nike', category: 'Footwear', sku: `NIKE-AIRJ-${Math.floor(Math.random() * 1000)}` }
            ];
            await ProductMaster.insertMany(sampleProducts);
        }

        res.json({ message: 'Role updated and sample products created' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, updatePassword, forgotPassword, resetPassword, initializeAdmin, fixRole };
