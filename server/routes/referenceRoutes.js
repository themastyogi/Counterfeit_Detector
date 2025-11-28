const express = require('express');
const router = express.Router();
const { verifyToken, isTenantAdmin, isSystemAdmin } = require('../middleware/authMiddleware');
const { checkFeature } = require('../middleware/featureMiddleware');
const ProductReference = require('../models/ProductReference');
const upload = require('multer')({ dest: 'uploads/references/' });
const fs = require('fs');
const path = require('path');
const { extractFingerprint } = require('../services/referenceComparison');

/**
 * Upload reference image for a product
 * POST /api/references/upload
 */
router.post('/upload', verifyToken, isTenantAdmin, checkFeature('reference_comparison'), upload.single('image'), async (req, res) => {
    try {
        const { product_id, notes } = req.body;
        const image_path = req.file ? req.file.path : null;

        if (!product_id || !image_path) {
            return res.status(400).json({ message: 'Product ID and image are required' });
        }

        // Extract fingerprint from the uploaded image
        const fingerprint = await extractFingerprint(image_path);

        const reference = new ProductReference({
            product_id,
            reference_image_path: image_path,
            fingerprint,
            notes,
            created_by: req.user.id,
            tenant_id: req.user.tenant_id
        });

        await reference.save();

        res.status(201).json({
            message: 'Reference image uploaded successfully',
            reference
        });
    } catch (error) {
        console.error('Error uploading reference:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get reference images for a product
 * GET /api/references/product/:productId
 */
router.get('/product/:productId', verifyToken, async (req, res) => {
    try {
        const references = await ProductReference.find({
            product_id: req.params.productId,
            is_active: true
        });
        res.json(references);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get all reference images (admin only)
 * GET /api/references
 */
router.get('/', verifyToken, isTenantAdmin, checkFeature('reference_comparison'), async (req, res) => {
    try {
        const query = req.user.role === 'tenant_admin' && req.user.tenant_id
            ? { tenant_id: req.user.tenant_id }
            : {};

        // Filter by active
        query.is_active = true;

        const references = await ProductReference.find(query)
            .populate('product_id', 'product_name brand category')
            .sort({ createdAt: -1 });

        res.json(references);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Delete a reference image
 * DELETE /api/references/:id
 */
router.delete('/:id', verifyToken, isTenantAdmin, checkFeature('reference_comparison'), async (req, res) => {
    try {
        const reference = await ProductReference.findById(req.params.id);

        if (!reference) {
            return res.status(404).json({ message: 'Reference not found' });
        }

        // Check ownership/permissions
        if (req.user.role !== 'system_admin' &&
            reference.tenant_id &&
            reference.tenant_id.toString() !== req.user.tenant_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Soft delete
        reference.is_active = false;
        await reference.save();

        res.json({ message: 'Reference deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Regenerate fingerprint for a reference image
 * POST /api/references/:id/regenerate
 */
router.post('/:id/regenerate', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const reference = await ProductReference.findById(req.params.id);

        if (!reference) {
            return res.status(404).json({ message: 'Reference not found' });
        }

        const fingerprint = await extractFingerprint(reference.reference_image_path);
        reference.fingerprint = fingerprint;
        await reference.save();

        res.json({ message: 'Fingerprint regenerated successfully', fingerprint });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
