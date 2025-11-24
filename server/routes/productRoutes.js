const express = require('express');
const router = express.Router();
const { verifyToken, isTenantAdmin } = require('../middleware/authMiddleware');
const ProductMaster = require('../models/ProductMaster');

// --- Product Management (Tenant Admin) ---

// Get all products for the tenant (or all products for system admins)
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('📦 GET /api/products - User:', req.user);
        let products;
        if (req.user.role === 'system_admin') {
            // System admins see all products
            console.log('✅ System admin detected, fetching ALL products');
            products = await ProductMaster.find().sort({ createdAt: -1 });
            console.log(`📊 Found ${products.length} products`);
        } else if (req.user.tenant_id) {
            // Tenant users see only their tenant's products
            console.log(`🏢 Tenant user, fetching products for tenant: ${req.user.tenant_id}`);
            products = await ProductMaster.find({ tenant_id: req.user.tenant_id }).sort({ createdAt: -1 });
            console.log(`📊 Found ${products.length} products`);
        } else {
            console.log('❌ No role or tenant_id, denying access');
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(products);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new product
router.post('/', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const { brand, sku, product_name, expected_logo_text, expected_domain, valid_batch_pattern, metadata_json } = req.body;

        const newProduct = new ProductMaster({
            tenant_id: req.user.tenant_id,
            brand,
            sku,
            product_name,
            expected_logo_text,
            expected_domain,
            valid_batch_pattern,
            metadata_json
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        // Handle duplicate SKU error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Product with this SKU already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a product
router.put('/:id', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const { brand, sku, product_name, expected_logo_text, expected_domain, valid_batch_pattern, metadata_json } = req.body;

        const product = await ProductMaster.findOne({ _id: req.params.id, tenant_id: req.user.tenant_id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.brand = brand || product.brand;
        product.sku = sku || product.sku;
        product.product_name = product_name || product.product_name;
        product.expected_logo_text = expected_logo_text || product.expected_logo_text;
        product.expected_domain = expected_domain || product.expected_domain;
        product.valid_batch_pattern = valid_batch_pattern || product.valid_batch_pattern;
        product.metadata_json = metadata_json || product.metadata_json;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a product
router.delete('/:id', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const product = await ProductMaster.findOneAndDelete({ _id: req.params.id, tenant_id: req.user.tenant_id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
