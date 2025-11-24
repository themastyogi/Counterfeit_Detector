const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('./models/Tenant');
const Plan = require('./models/Plan');
const TenantPlan = require('./models/TenantPlan');
const ProductMaster = require('./models/ProductMaster');

async function seedData() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected successfully!\n');

        // 1. Create Plans
        console.log('📋 Creating subscription plans...');
        const plans = [
            {
                name: 'STARTER',
                description: 'Perfect for small businesses',
                local_quota_per_month: 100,
                high_quota_per_month: 20,
                price_per_month: 29.99,
                is_active: true
            },
            {
                name: 'PROFESSIONAL',
                description: 'For growing companies',
                local_quota_per_month: 500,
                high_quota_per_month: 100,
                price_per_month: 99.99,
                is_active: true
            },
            {
                name: 'ENTERPRISE',
                description: 'Unlimited for large organizations',
                local_quota_per_month: -1, // -1 = unlimited
                high_quota_per_month: -1,
                price_per_month: 299.99,
                is_active: true
            }
        ];

        const createdPlans = [];
        for (const planData of plans) {
            const existing = await Plan.findOne({ name: planData.name });
            if (existing) {
                console.log(`  ↪ Plan "${planData.name}" already exists`);
                createdPlans.push(existing);
            } else {
                const plan = new Plan(planData);
                await plan.save();
                createdPlans.push(plan);
                console.log(`  ✅ Created plan: ${planData.name} ($${planData.price_per_month}/month)`);
            }
        }

        // 2. Create Sample Tenant
        console.log('\n🏢 Creating sample tenant...');
        let tenant = await Tenant.findOne({ code: 'ACME' });
        if (!tenant) {
            tenant = new Tenant({
                name: 'Acme Electronics Corp',
                code: 'ACME',
                status: 'ACTIVE'
            });
            await tenant.save();
            console.log(`  ✅ Created tenant: ${tenant.name} (${tenant.code})`);
        } else {
            console.log(`  ↪ Tenant "${tenant.name}" already exists`);
        }

        // 3. Link Tenant to Plan
        console.log('\n🔗 Linking tenant to Professional plan...');
        const professionalPlan = createdPlans.find(p => p.name === 'PROFESSIONAL');
        let tenantPlan = await TenantPlan.findOne({ tenant_id: tenant._id });
        if (!tenantPlan) {
            tenantPlan = new TenantPlan({
                tenant_id: tenant._id,
                plan_id: professionalPlan._id,
                start_date: new Date(),
                status: 'ACTIVE'
            });
            await tenantPlan.save();
            console.log('  ✅ Tenant subscribed to Professional plan');
        } else {
            console.log('  ↪ Tenant already has an active plan');
        }

        // 4. Create Sample Products
        console.log('\n📦 Creating sample products...');
        const products = [
            {
                tenant_id: tenant._id,
                product_name: 'iPhone 15 Pro',
                brand: 'Apple',
                category: 'Smartphones',
                sku: 'APPL-IPH15P-256-TIT',
                description: 'Latest flagship smartphone with titanium design',
                manufacturer_country: 'China (Designed in California)',
                GTIN: '0194253102526',
                authenticity_markers: {
                    serial_format: '^[A-Z0-9]{12}$',
                    hologram_details: 'Apple holographic seal on box',
                    packaging_features: 'Premium white box with embossed Apple logo'
                }
            },
            {
                tenant_id: tenant._id,
                product_name: 'Samsung Galaxy S24 Ultra',
                brand: 'Samsung',
                category: 'Smartphones',
                sku: 'SMSG-S24U-512-BLK',
                description: 'Premium Android flagship with S Pen',
                manufacturer_country: 'South Korea',
                GTIN: '8806095162904',
                authenticity_markers: {
                    serial_format: '^R[0-9]{11}$',
                    hologram_details: 'Samsung holographic sticker',
                    packaging_features: 'Black premium box with UV-reactive pattern'
                }
            },
            {
                tenant_id: tenant._id,
                product_name: 'AirPods Pro (2nd Gen)',
                brand: 'Apple',
                category: 'Audio',
                sku: 'APPL-APRO2-WHT',
                description: 'Premium wireless earbuds with active noise cancellation',
                manufacturer_country: 'Vietnam',
                GTIN: '0194253398509',
                authenticity_markers: {
                    serial_format: '^[A-Z0-9]{12}$',
                    hologram_details: 'Apple authenticity seal',
                    packaging_features: 'Compact white box with pull-tab design'
                }
            },
            {
                tenant_id: tenant._id,
                product_name: 'Sony WH-1000XM5',
                brand: 'Sony',
                category: 'Audio',
                sku: 'SONY-WH1000XM5-BLK',
                description: 'Industry-leading noise canceling headphones',
                manufacturer_country: 'Malaysia',
                GTIN: '4548736134775',
                authenticity_markers: {
                    serial_format: '^[0-9]{10}$',
                    hologram_details: 'Sony authenticity hologram on box',
                    packaging_features: 'Premium black box with gold accents'
                }
            },
            {
                tenant_id: tenant._id,
                product_name: 'Nintendo Switch OLED',
                brand: 'Nintendo',
                category: 'Gaming',
                sku: 'NINT-SWCH-OLED-WHT',
                description: 'Hybrid gaming console with vibrant OLED screen',
                manufacturer_country: 'China',
                GTIN: '0045496883041',
                authenticity_markers: {
                    serial_format: '^XK[0-9]{10}$',
                    hologram_details: 'Nintendo seal of quality',
                    packaging_features: 'Red and white box with OLED branding'
                }
            },
            {
                tenant_id: tenant._id,
                product_name: 'Ray-Ban Aviator Classic',
                brand: 'Ray-Ban',
                category: 'Eyewear',
                sku: 'RB-AV-3025-GLD',
                description: 'Iconic aviator sunglasses',
                manufacturer_country: 'Italy',
                GTIN: '8056597378147',
                authenticity_markers: {
                    serial_format: '^RB[0-9]{4}-[0-9]{6}$',
                    hologram_details: 'Ray-Ban logo etched on lens',
                    packaging_features: 'Signature brown case with cleaning cloth'
                }
            }
        ];

        for (const productData of products) {
            const existing = await ProductMaster.findOne({
                tenant_id: tenant._id,
                sku: productData.sku
            });

            if (existing) {
                console.log(`  ↪ Product "${productData.product_name}" already exists`);
            } else {
                const product = new ProductMaster(productData);
                await product.save();
                console.log(`  ✅ Created: ${productData.brand} ${productData.product_name} (${productData.sku})`);
            }
        }

        console.log('\n🎉 Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`  • Plans: ${createdPlans.length}`);
        console.log(`  • Tenants: 1 (${tenant.tenant_name})`);
        console.log(`  • Products: ${products.length}`);
        console.log('\n✅ Your database is ready for testing!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
