const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('Connecting to:', mongoURI.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(mongoURI);
        console.log('✅ Connected successfully!');
        console.log('📦 Database:', mongoose.connection.db.databaseName);

        // Define User schema
        const userSchema = new mongoose.Schema({
            fullName: String,
            email: String,
            password: String,
            role: String,
            status: String,
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@veriscan.com' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('   Email:', existingAdmin.email);
            console.log('   Role:', existingAdmin.role);
        } else {
            console.log('Creating admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123', salt);

            const adminUser = new User({
                fullName: 'System Administrator',
                email: 'admin@veriscan.com',
                password: hashedPassword,
                role: 'system_admin',
                status: 'ACTIVE'
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');
            console.log('   Email: admin@veriscan.com');
            console.log('   Password: Admin@123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createAdmin();
