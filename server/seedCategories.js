const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TestCategory = require('./models/TestCategory');
const User = require('./models/User');

dotenv.config();

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@veriscan.com' });
        if (!admin) {
            console.log('❌ Admin user not found. Please run the server first to create admin account.');
            process.exit(1);
        }

        // Default categories
        const categories = [
            {
                name: 'Currency',
                description: 'Test currency notes for authenticity (watermarks, security threads, etc.)',
                icon: 'Banknote',
                createdBy: admin._id
            },
            {
                name: 'Label',
                description: 'Verify product labels and packaging for authenticity',
                icon: 'Tag',
                createdBy: admin._id
            },
            {
                name: 'Barcode',
                description: 'Scan and verify barcodes and QR codes',
                icon: 'QrCode',
                createdBy: admin._id
            },
            {
                name: 'Food Product',
                description: 'Authenticate food products and packaging',
                icon: 'Apple',
                createdBy: admin._id
            }
        ];

        // Clear existing categories (optional)
        await TestCategory.deleteMany({});
        console.log('🗑️  Cleared existing categories');

        // Insert categories
        const result = await TestCategory.insertMany(categories);
        console.log(`✅ Created ${result.length} test categories:`);
        result.forEach(cat => {
            console.log(`   - ${cat.name}`);
        });

        console.log('\n✨ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedCategories();
