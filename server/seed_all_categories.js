const mongoose = require('mongoose');
require('dotenv').config();

const Tenant = require('./models/Tenant');
const ProductMaster = require('./models/ProductMaster');

async function seedAllCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get or create tenant
        let tenant = await Tenant.findOne({ code: 'ACME' });
        if (!tenant) {
            tenant = await Tenant.create({ name: 'Acme Electronics Corp', code: 'ACME', status: 'ACTIVE' });
            console.log(`✅ Created tenant: ${tenant.name}`);
        }

        // Comprehensive category list
        console.log('\n📦 Creating 50+ product categories...');
        const categories = [
            // Electronics
            'Smartphones', 'Tablets', 'Laptops', 'Desktop Computers', 'Smart Watches', 'Fitness Trackers',
            'Headphones', 'Earbuds', 'Speakers', 'Cameras', 'Drones', 'Gaming Consoles', 'VR Headsets',
            'Smart Home Devices', 'Power Banks', 'Chargers', 'USB Cables', 'Memory Cards', 'Hard Drives',

            // Fashion & Accessories
            'Sunglasses', 'Eyeglasses', 'Handbags', 'Wallets', 'Belts', 'Watches', 'Jewelry',
            'Shoes', 'Sneakers', 'Boots', 'Sandals', 'Clothing', 'Jackets', 'Hats', 'Scarves',

            // Beauty & Personal Care
            'Perfumes', 'Cosmetics', 'Skincare Products', 'Hair Care Products', 'Nail Polish',

            // Sports & Outdoor
            'Sports Equipment', 'Fitness Equipment', 'Bicycles', 'Camping Gear', 'Hiking Gear',

            // Home & Kitchen
            'Kitchen Appliances', 'Cookware', 'Cutlery', 'Home Decor', 'Furniture',

            // Automotive
            'Car Parts', 'Car Accessories', 'Motorcycle Parts', 'Tires',

            // Toys & Games
            'Toys', 'Board Games', 'Action Figures', 'Collectibles',

            // Health & Medical
            'Medicines', 'Supplements', 'Medical Devices', 'First Aid Kits',

            // Food & Beverages
            'Packaged Foods', 'Beverages', 'Alcohol', 'Coffee', 'Tea',

            // Books & Media
            'Books', 'DVDs', 'Blu-rays', 'Video Games',

            // Office & Stationery
            'Office Supplies', 'Pens', 'Notebooks', 'Printers',

            // Other
            'Other'
        ];

        let created = 0;
        let existing = 0;

        for (const category of categories) {
            const sku = `CAT-${category.toUpperCase().replace(/\s+/g, '-').replace(/&/g, 'AND')}`;
            const existingProduct = await ProductMaster.findOne({ sku });

            if (!existingProduct) {
                await ProductMaster.create({
                    tenant_id: tenant._id,
                    product_name: category,
                    brand: 'Generic',
                    category: category,
                    sku: sku,
                    description: `${category} category for counterfeit detection`
                });
                created++;
                console.log(`✅ Created: ${category}`);
            } else {
                existing++;
            }
        }

        console.log(`\n🎉 Category seeding complete!`);
        console.log(`📊 Summary:`);
        console.log(`  • Total categories: ${categories.length}`);
        console.log(`  • Newly created: ${created}`);
        console.log(`  • Already existed: ${existing}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedAllCategories();
