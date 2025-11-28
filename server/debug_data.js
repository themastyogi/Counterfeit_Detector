const mongoose = require('mongoose');
require('dotenv').config();

const ProductMaster = require('./models/ProductMaster');
const User = require('./models/User');
const Tenant = require('./models/Tenant');

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check products
        const products = await ProductMaster.find().limit(3);
        console.log('📦 Sample Products:');
        products.forEach(p => {
            console.log(`  - ${p.product_name}`);
            console.log(`    tenant_id: ${p.tenant_id} (type: ${typeof p.tenant_id})`);
        });

        // Check admin user
        const admin = await User.findOne({ email: 'admin@veriscan.com' });
        console.log('\n👤 Admin User:');
        console.log(`  tenant_id: ${admin.tenant_id || 'NULL'} (type: ${typeof admin.tenant_id})`);
        console.log(`  role: ${admin.role}`);

        // Check tenants
        const tenants = await Tenant.find();
        console.log('\n🏢 Tenants:');
        tenants.forEach(t => {
            console.log(`  - ${t.name} (${t.code})`);
            console.log(`    _id: ${t._id} (type: ${typeof t._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

debugData();
