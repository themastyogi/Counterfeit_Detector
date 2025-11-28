const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const ProductReference = require('../models/ProductReference');
const { analyzeImage } = require('../services/visionService');
const multer = require('multer');

// Configure Multer for reference image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/references/');
    },
    filename: (req, file, cb) => {
        cb(null, `ref-${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Ensure upload directory exists
const fs = require('fs');
const path = require('path');
const refDir = path.join(__dirname, '../uploads/references');
if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
}

/**
 * Upload reference image for a product
 * POST /api/references/upload
 */
router.post('/upload', verifyToken, isTenantAdmin, upload.single('image'), async (req, res) => {
    try {
        const { product_id, notes } = req.body;
        const image_path = req.file ? req.file.path : null;

        if (!image_path) {
            return res.status(400).json({ message: 'Reference image is required' });
        }

        if (!product_id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        console.log('📸 Processing reference image for product:', product_id);

        // Analyze the reference image to create fingerprint
        const visionResult = await analyzeImage(image_path);

        // Create fingerprint
        const fingerprint = {
            dominantColors: visionResult.imageProperties?.dominantColors || [],
            logos: visionResult.logos || [],
            textPatterns: {
                text: visionResult.textDetection?.text || '',
                confidence: visionResult.textDetection?.confidence || 0
            },
            imageProperties: {
                width: 0, // Could be extracted from image metadata
                height: 0,
                aspectRatio: 0
            }
        };

        // Create reference record
        const reference = new ProductReference({
            product_id,
            reference_image_path: image_path,
            fingerprint,
            uploaded_by: req.user.id,
            notes: notes || ''
        });

        await reference.save();

        console.log('✅ Reference image saved:', reference._id);

        res.status(201).json({
            message: 'Reference image uploaded successfully',
            reference: {
                id: reference._id,
                product_id: reference.product_id,
                image_path: reference.reference_image_path,
                fingerprint: reference.fingerprint
            }
        });
    } catch (error) {
        console.error('❌ Reference upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get all reference images for a product
 * GET /api/references/product/:productId
 */
router.get('/product/:productId', verifyToken, async (req, res) => {
    try {
        const references = await ProductReference.find({
            product_id: req.params.productId,
            is_active: true
        }).populate('uploaded_by', 'fullName email');

        res.json(references);
    } catch (error) {
        console.error('❌ Error fetching references:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get all reference images (admin only)
 * GET /api/references
 */
router.get('/', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const query = req.user.role === 'tenant_admin' && req.user.tenant_id
            ? { tenant_id: req.user.tenant_id }
            : {};

        const references = await ProductReference.find(query)
            .populate('product_id', 'product_name brand category')
            .populate('uploaded_by', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(references);
    } catch (error) {
        console.error('❌ Error fetching references:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Delete a reference image
 * DELETE /api/references/:id
 */
router.delete('/:id', verifyToken, isTenantAdmin, async (req, res) => {
    try {
        const reference = await ProductReference.findById(req.params.id);

        if (!reference) {
            return res.status(404).json({ message: 'Reference not found' });
        }

        // Soft delete (mark as inactive)
        reference.is_active = false;
        await reference.save();

        res.json({ message: 'Reference deactivated successfully' });
    } catch (error) {
        console.error('❌ Error deleting reference:', error);
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

        console.log('🔄 Regenerating fingerprint for reference:', reference._id);

        // Re-analyze the image
        const visionResult = await analyzeImage(reference.reference_image_path);

        // Update fingerprint
        reference.fingerprint = {
            dominantColors: visionResult.imageProperties?.dominantColors || [],
            logos: visionResult.logos || [],
            textPatterns: {
                text: visionResult.textDetection?.text || '',
                confidence: visionResult.textDetection?.confidence || 0
            },
            imageProperties: reference.fingerprint.imageProperties // Keep existing
        };

        await reference.save();

        console.log('✅ Fingerprint regenerated');

        res.json({
            message: 'Fingerprint regenerated successfully',
            fingerprint: reference.fingerprint
        });
    } catch (error) {
        console.error('❌ Error regenerating fingerprint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
