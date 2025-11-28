const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Plan = require('./models/Plan');

dotenv.config();

const seedPlans = async () => {
    try {
        await connectDB();
        console.log('Connected to database...');

        // Update Standard Plan (No reference comparison)
        await Plan.findOneAndUpdate(
            { name: 'STANDARD' },
            {
                $set: {
                    'features.reference_comparison': false
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ Updated Standard Plan');

        // Update Premium Plan (With reference comparison)
        await Plan.findOneAndUpdate(
            { name: 'PREMIUM' },
            {
                $set: {
                    'features.reference_comparison': true
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ Updated Premium Plan');

        // Update Enterprise Plan (With reference comparison)
        await Plan.findOneAndUpdate(
            { name: 'ENTERPRISE' },
            {
                $set: {
                    'features.reference_comparison': true
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ Updated Enterprise Plan');

        console.log('🎉 Plan features updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
