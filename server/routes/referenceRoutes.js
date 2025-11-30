const express = require('express');
const router = express.Router();
const { verifyToken, isTenantAdmin, isSystemAdmin } = require('../middleware/authMiddleware');
const { checkFeature } = require('../middleware/featureMiddleware');
const ProductReference = require('../models/ProductReference');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { extractFingerprint } = require('../services/referenceComparison');

// Use memory storage instead of disk storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload reference image for a product
 * POST /api/references/upload
 */
router.post('/upload', verifyToken, isTenantAdmin, upload.single('image'), async (req, res) => {
    try {
        console.log('📸 Reference upload - Start');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { product_id, notes } = req.body;

        if (!product_id || !req.file) {
            console.log('❌ Missing product_id or image file');
            return res.status(400).json({ message: 'Product ID and image are required' });
        }

        console.log('☁️ Uploading to Cloudinary...');

        // Upload to Cloudinary using buffer
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'counterfeit_detector/references',
                    resource_type: 'image',
                    public_id: `ref_${product_id}_${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        console.log('✅ Cloudinary upload successful:', uploadResult.secure_url);

        // For fingerprint extraction, we need to download the image temporarily
        // Or we can use the Cloudinary URL directly if extractFingerprint supports URLs
        console.log('✅ Extracting fingerprint from Cloudinary URL...');
        const fingerprint = await extractFingerprint(uploadResult.secure_url);

        console.log('✅ Fingerprint extracted, creating reference...');

        const reference = new ProductReference({
            product_id,
            reference_image_path: uploadResult.secure_url, // Store Cloudinary URL
            fingerprint,
            notes,
            uploaded_by: req.user.id
        });

        console.log('💾 Saving reference to database...');
        await reference.save();

        console.log('✅ Reference saved successfully');

        res.status(201).json({
            message: 'Reference image uploaded successfully',
            reference
        });
    } catch (error) {
        console.error('❌ Error uploading reference:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
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
        })
            .populate('uploaded_by', 'name email')
            .populate('product_id', 'product_name brand category sku');
        res.json(references);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get all reference images
 * GET /api/references
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = {};

        // System admins see all references
        if (req.user.role === 'system_admin') {
            query = {};
        }
        // Tenant users see only their tenant's references
        else if (req.user.tenant_id) {
            query.tenant_id = req.user.tenant_id;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Filter by active
        query.is_active = true;

        const references = await ProductReference.find(query)
            .populate('product_id', 'product_name brand category sku')
            .sort({ createdAt: -1 });

        console.log(`📸 Fetched ${references.length} references for user ${req.user.id}`);
        res.json(references);
    } catch (error) {
        console.error('Error fetching references:', error);
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

        // Delete from Cloudinary if it's a Cloudinary URL
        if (reference.reference_image_path && reference.reference_image_path.includes('cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = reference.reference_image_path.split('/');
                const filename = urlParts[urlParts.length - 1].split('.')[0];
                const folder = 'counterfeit_detector/references';
                const public_id = `${folder}/${filename}`;

                console.log('🗑️ Deleting from Cloudinary:', public_id);
                await cloudinary.uploader.destroy(public_id);
                console.log('✅ Deleted from Cloudinary');
            } catch (cloudError) {
                console.error('⚠️ Failed to delete from Cloudinary:', cloudError.message);
                // Continue with soft delete even if Cloudinary deletion fails
            }
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
