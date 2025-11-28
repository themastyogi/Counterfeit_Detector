const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@veriscan.com' });

        if (!admin) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('\n📊 Current admin user:');
        console.log('  Email:', admin.email);
        console.log('  Role:', admin.role);
        console.log('  Tenant ID:', admin.tenant_id || 'None');

        if (admin.role !== 'system_admin') {
            admin.role = 'system_admin';
            await admin.save();
            console.log('\n✅ Updated admin role to system_admin');
        } else {
            console.log('\n✅ Admin already has system_admin role');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAdmin();
