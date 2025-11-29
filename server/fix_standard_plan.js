const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const fixPlan = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/counterfeit_detector';
        console.log('Connecting to:', mongoUri);

        await mongoose.connect(mongoUri);
        console.log('Connected to database...');

        const Plan = require('./models/Plan');

        // Update Standard Plan
        const result = await Plan.updateOne(
            { name: /^standard$/i },
            { $set: { 'features.reference_comparison': true } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount > 0) {
            console.log('✅ Successfully enabled reference_comparison for Standard plan');
        } else {
            console.log('ℹ️ Standard plan was already updated or not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixPlan();
