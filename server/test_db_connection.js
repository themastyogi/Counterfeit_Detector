const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/counterfeit_detector';
        console.log('Attempting to connect to:', mongoURI.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(mongoURI);
        console.log('✅ Connected successfully!');

        // List all databases
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('\n📁 Available databases:');
        dbs.databases.forEach(db => {
            console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });

        // List collections in current database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📦 Collections in "${mongoose.connection.db.databaseName}":`);
        if (collections.length === 0) {
            console.log('  (empty - no collections yet)');
        } else {
            collections.forEach(col => {
                console.log(`  - ${col.name}`);
            });
        }

        // Try to query users collection
        console.log('\n🔍 Testing users.findOne()...');
        const User = mongoose.connection.collection('users');
        const userCount = await User.countDocuments();
        console.log(`  Found ${userCount} users`);

        if (userCount > 0) {
            const firstUser = await User.findOne();
            console.log(`  First user email: ${firstUser.email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testConnection();
