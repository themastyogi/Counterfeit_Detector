const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedGlobalProducts = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/counterfeit_detector';
        console.log('Connecting to:', mongoUri);

        await mongoose.connect(mongoUri);
        console.log('Connected to database...');

        const ProductMaster = require('./models/ProductMaster');
        const Tenant = require('./models/Tenant');

        // Find system admin tenant or create a dummy one for global products
        // Ideally global products might not need a tenant_id if we make it optional, 
        // but schema says required. Let's find the first tenant or system admin's tenant.
        let systemTenant = await Tenant.findOne({ name: 'System Admin' });
        if (!systemTenant) {
            systemTenant = await Tenant.findOne(); // Fallback to any tenant
        }

        if (!systemTenant) {
            console.log('❌ No tenant found to assign global products to. Please create a tenant first.');
            process.exit(1);
        }

        const globalProducts = [
            {
                tenant_id: systemTenant._id,
                brand: 'Generic',
                sku: 'GLOBAL-ELEC-001',
                product_name: 'General Electronics',
                category: 'Electronics',
                is_global: true,
                description: 'Global category for electronic items'
            },
            {
                tenant_id: systemTenant._id,
                brand: 'Generic',
                sku: 'GLOBAL-PHARMA-001',
                product_name: 'General Pharmaceuticals',
                category: 'Pharmaceuticals',
                is_global: true,
                description: 'Global category for medicines'
            },
            {
                tenant_id: systemTenant._id,
                brand: 'Generic',
                sku: 'GLOBAL-FMCG-001',
                product_name: 'FMCG Standard',
                category: 'FMCG',
                is_global: true,
                description: 'Global category for Fast Moving Consumer Goods'
            },
            {
                tenant_id: systemTenant._id,
                brand: 'Generic',
                sku: 'GLOBAL-AUTO-001',
                product_name: 'Automotive Parts',
                category: 'Automotive',
                is_global: true,
                description: 'Global category for vehicle parts'
            }
        ];

        for (const product of globalProducts) {
            await ProductMaster.findOneAndUpdate(
                { sku: product.sku },
                product,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded global product: ${product.product_name}`);
        }

        console.log('🎉 Global products seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding global products:', error);
        process.exit(1);
    }
};

seedGlobalProducts();
