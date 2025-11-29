// Enable reference_comparison feature for Standard plan
const mongoose = require('mongoose');
require('dotenv').config();

async function enableReferenceFeature() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        const Plan = require('./models/Plan');

        // Update Standard plan to enable reference_comparison
        const result = await Plan.updateOne(
            { name: 'STANDARD' },
            { $set: { 'features.reference_comparison': true } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Standard plan updated with reference_comparison feature');
        } else {
            console.log('⚠️  Standard plan not found or already has the feature');

            // Try to find and update by any case variation
            const plan = await Plan.findOne({ name: /^standard$/i });
            if (plan) {
                plan.features = plan.features || {};
                plan.features.reference_comparison = true;
                await plan.save();
                console.log('✅ Plan updated:', plan.name);
            } else {
                console.log('❌ No Standard plan found in database');
            }
        }

        console.log('\n🎉 Feature enabled successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

enableReferenceFeature();
