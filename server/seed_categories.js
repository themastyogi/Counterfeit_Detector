const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('./models/Tenant');
const Plan = require('./models/Plan');
const TenantPlan = require('./models/TenantPlan');
const ProductMaster = require('./models/ProductMaster');

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get or create tenant
        let tenant = await Tenant.findOne({ code: 'ACME' });
        if (!tenant) {
            tenant = await Tenant.create({ name: 'Acme Electronics Corp', code: 'ACME', status: 'ACTIVE' });
            console.log(`✅ Created tenant: ${tenant.name}`);
        }

        // Create category-based products
        console.log('\n📦 Creating category products...');
        const categories = [
            { category: 'Smartphones', brand: 'Generic', sku: 'CAT-SMARTPHONE' },
            { category: 'Audio', brand: 'Generic', sku: 'CAT-AUDIO' },
            { category: 'Eyewear', brand: 'Generic', sku: 'CAT-EYEWEAR' },
            { category: 'Gaming', brand: 'Generic', sku: 'CAT-GAMING' },
            { category: 'Watches', brand: 'Generic', sku: 'CAT-WATCHES' },
            { category: 'Accessories', brand: 'Generic', sku: 'CAT-ACCESSORIES' },
            { category: 'Other', brand: 'Generic', sku: 'CAT-OTHER' }
        ];

        for (const cat of categories) {
            const existing = await ProductMaster.findOne({ sku: cat.sku });
            if (!existing) {
                await ProductMaster.create({
                    tenant_id: tenant._id,
                    product_name: cat.category,
                    brand: cat.brand,
                    category: cat.category,
                    sku: cat.sku,
                    description: `General ${cat.category} category`
                });
                console.log(`✅ Created: ${cat.category}`);
            } else {
                console.log(`↪ ${cat.category} already exists`);
            }
        }

        console.log('\n🎉 Category products created!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedCategories();
