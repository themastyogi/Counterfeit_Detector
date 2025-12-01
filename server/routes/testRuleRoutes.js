const express = require('express');
const router = express.Router();
const TestRule = require('../models/TestRule');
const { verifyToken, isTenantAdmin } = require('../middleware/authMiddleware');

// @desc    Get all test rules for a product
// @route   GET /api/test-rules/product/:productId
// @access  Private/Admin
router.get('/product/:productId', verifyToken, async (req, res) => {
    try {
        const rules = await TestRule.find({ product_id: req.params.productId }).sort({ is_default: -1, name: 1 });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching test rules', error: error.message });
    }
});

// @desc    Create a new test rule profile
// @route   POST /api/test-rules
// @access  Private/Admin
router.post('/', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const { product_id, name, rules, weights, is_default } = req.body;

        // If setting as default, unset previous default
        if (is_default) {
            await TestRule.updateMany(
                { product_id, is_default: true },
                { is_default: false }
            );
        }

        const testRule = await TestRule.create({
            product_id,
            name,
            rules,
            weights,
            is_default: is_default || false,
            createdBy: req.user._id
        });

        res.status(201).json(testRule);
    } catch (error) {
        res.status(400).json({ message: 'Error creating test rule', error: error.message });
    }
});

// @desc    Update a test rule profile
// @route   PUT /api/test-rules/:id
// @access  Private/Admin
router.put('/:id', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const { name, rules, weights, is_default } = req.body;
        const testRule = await TestRule.findById(req.params.id);

        if (!testRule) {
            return res.status(404).json({ message: 'Test rule not found' });
        }

        // If setting as default, unset previous default
        if (is_default) {
            await TestRule.updateMany(
                { product_id: testRule.product_id, is_default: true, _id: { $ne: testRule._id } },
                { is_default: false }
            );
        }

        testRule.name = name || testRule.name;
        testRule.rules = rules || testRule.rules;
        testRule.weights = weights || testRule.weights;
        if (is_default !== undefined) testRule.is_default = is_default;

        const updatedRule = await testRule.save();
        res.json(updatedRule);
    } catch (error) {
        res.status(400).json({ message: 'Error updating test rule', error: error.message });
    }
});

// @desc    Delete a test rule profile
// @route   DELETE /api/test-rules/:id
// @access  Private/Admin
router.delete('/:id', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const testRule = await TestRule.findById(req.params.id);

        if (!testRule) {
            return res.status(404).json({ message: 'Test rule not found' });
        }

        await testRule.deleteOne();
        res.json({ message: 'Test rule removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting test rule', error: error.message });
    }
});

module.exports = router;
