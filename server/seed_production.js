// This script seeds the production database
// Run this ONCE on Render using: node server/seed_production.js

const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('./models/Tenant');
const Plan = require('./models/Plan');
const ProductMaster = require('./models/ProductMaster');

async function seedProduction() {
    try {
        console.log('🔌 Connecting to production MongoDB...');
        console.log('URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!\n');

        // Create Plans
        console.log('📋 Creating plans...');
        const plans = [
            { name: 'STARTER', description: 'Perfect for small businesses', local_quota_per_month: 100, high_quota_per_month: 20, price_per_month: 29.99, is_active: true },
            { name: 'PROFESSIONAL', description: 'For growing companies', local_quota_per_month: 500, high_quota_per_month: 100, price_per_month: 99.99, is_active: true },
            { name: 'ENTERPRISE', description: 'Unlimited for large organizations', local_quota_per_month: -1, high_quota_per_month: -1, price_per_month: 299.99, is_active: true }
        ];

        for (const p of plans) {
            const existing = await Plan.findOne({ name: p.name });
            if (!existing) {
                await Plan.create(p);
                console.log(`✅ Created plan: ${p.name}`);
            } else {
                console.log(`↪ Plan ${p.name} exists`);
            }
        }

        // Create Tenant
        console.log('\n🏢 Creating tenant...');
        let tenant = await Tenant.findOne({ code: 'ACME' });
        if (!tenant) {
            tenant = await Tenant.create({ name: 'Acme Electronics Corp', code: 'ACME', status: 'ACTIVE' });
            console.log(`✅ Created tenant: ${tenant.name}`);
        } else {
            console.log(`↪ Tenant ${tenant.name} exists`);
        }

        // Create Products
        console.log('\n📦 Creating products...');
        const products = [
            { tenant_id: tenant._id, product_name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', sku: 'APPL-IPH15P-256-TIT' },
            { tenant_id: tenant._id, product_name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', sku: 'SMSG-S24U-512-BLK' },
            { tenant_id: tenant._id, product_name: 'AirPods Pro (2nd Gen)', brand: 'Apple', category: 'Audio', sku: 'APPL-APRO2-WHT' }
        ];

        for (const p of products) {
            const existing = await ProductMaster.findOne({ sku: p.sku });
            if (!existing) {
                await ProductMaster.create(p);
                console.log(`✅ Created: ${p.product_name}`);
            } else {
                console.log(`↪ Product ${p.product_name} exists`);
            }
        }

        console.log('\n🎉 Production database seeded!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedProduction();
