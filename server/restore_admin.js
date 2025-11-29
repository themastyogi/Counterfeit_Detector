const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const restoreAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/counterfeit_detector';
        console.log('Connecting to:', mongoUri);

        await mongoose.connect(mongoUri);
        console.log('Connected to database...');

        // 1. Restore default admin
        const defaultAdmin = await User.findOne({ email: 'admin@veriscan.com' });
        if (defaultAdmin) {
            defaultAdmin.role = 'system_admin';
            await defaultAdmin.save();
            console.log('✅ Restored admin@veriscan.com to system_admin');
        } else {
            console.log('⚠️  Default admin not found');
        }

        // 2. Restore any user with "admin" in their name or email (optional heuristic)
        // Or just list all users so we can see who exists
        const users = await User.find({}, 'fullName email role tenant_id');
        console.log('\nCurrent Users:');
        users.forEach(u => {
            console.log(`- ${u.fullName} (${u.email}): ${u.role} [${u.tenant_id}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

restoreAdmin();
