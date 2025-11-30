const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const ScanJob = require('../models/ScanJob');
const ScanHistory = require('../models/ScanHistory');
const ProductMaster = require('../models/ProductMaster');
const PlanUsage = require('../models/PlanUsage');
const multer = require('multer');
const path = require('path');
const { checkQuota, incrementUsage } = require('../services/quotaService');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// --- Scan Operations (End User / Manager) ---

// Submit a scan
router.post('/submit', verifyToken, upload.single('image'), async (req, res) => {
    try {
        console.log('🔍 Scan submit - Start');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { product_id, scan_type, reference_id } = req.body;
        const image_path = req.file ? req.file.path : null;

        if (!image_path) {
            console.log('❌ No image provided');
            return res.status(400).json({ message: 'Image is required' });
        }

        // System admins don't need a tenant_id
        if (!req.user.tenant_id && req.user.role !== 'system_admin') {
            console.log('❌ User has no tenant_id');
            return res.status(400).json({ message: 'User must belong to a tenant to perform scans' });
        }

        // Check Quota (skip for system admins)
        if (req.user.tenant_id) {
            console.log('⏳ Checking quota...');
            const quotaCheck = await checkQuota(req.user.tenant_id, scan_type);
            if (!quotaCheck.allowed) {
                console.log('❌ Quota exceeded');
                return res.status(403).json({ message: quotaCheck.message });
            }
            console.log('✅ Quota check passed');
        }

        // Validate product_id - if it's not a valid ObjectId, set to null
        let validProductId = null;
        if (product_id && product_id.match(/^[0-9a-fA-F]{24}$/)) {
            validProductId = product_id;
        } else if (product_id) {
            console.log('⚠️ Invalid product_id format, using null');
        }

        // Create Scan Job
        console.log('💾 Creating scan job...');
        const scanJob = new ScanJob({
            tenant_id: req.user.tenant_id || null,
            user_id: req.user.id,
            product_id: validProductId,
            scan_type: scan_type || 'AUTO',
            image_path,
            status: 'PENDING'
        });

        await scanJob.save();
        console.log('✅ Scan job created:', scanJob._id);

        // Perform scan using Vision API with NEW EVALUATION ENGINE
        console.log('🔎 Analyzing image...');
        const { analyzeImage } = require('../services/visionService');
        const { evaluateScan } = require('../services/scanEvaluationEngine');

        setTimeout(async () => {
            try {
                console.log('⚙️ Processing scan job:', scanJob._id);

                // Get Vision API analysis
                const visionResult = await analyzeImage(image_path);
                console.log('📊 Vision analysis complete');
                console.log('🔍 Data source:', visionResult.dataSource);
                console.log('📝 Detected text:', visionResult.textDetection?.text || 'No text detected');

                // Get product details
                let product = null;
                if (product_id) {
                    product = await ProductMaster.findById(product_id);
                    console.log('📦 Product loaded:', product?.product_name);
                }

                // Use NEW EVALUATION ENGINE
                const evaluation = await evaluateScan(
                    product || { brand: 'Unknown', category: 'Other', metadata_json: {} },
                    [image_path],
                    visionResult,
                    { reference_id }
                );

                console.log('🎯 Evaluation complete:', evaluation.used_mode);
                console.log('📊 Risk Score:', evaluation.risk_score);
                console.log('⚖️ Status:', evaluation.status);
                console.log('🚩 Violations:', evaluation.violations.length);

                // Map evaluation result to legacy format for compatibility
                const riskScore = evaluation.risk_score;
                const status = evaluation.status;
                const flags = {};

                // Convert violations to flags
                evaluation.violations.forEach(v => {
                    flags[v.code] = v.message;
                });

                // Add evaluation mode info
                flags['Evaluation Mode'] = evaluation.used_mode;

                // Build reference comparison data (if available)
                let referenceComparison = null;
                if (evaluation.used_mode === 'REFERENCE_COMPARE' && evaluation.debug_info.similarity !== undefined) {
                    const ProductReference = require('../models/ProductReference');
                    const reference = await ProductReference.findById(reference_id).populate('product_id');

                    if (reference) {
                        console.log('🔍 Reference found:', reference._id);
                        console.log('🖼️ Reference Image Path (raw):', reference.reference_image_path);

                        // Don't add / prefix to Cloudinary URLs
                        const normalizedPath = reference.reference_image_path
                            ? (reference.reference_image_path.startsWith('http')
                                ? reference.reference_image_path
                                : `/${reference.reference_image_path.replace(/\\/g, '/')}`)
                            : null;

                        console.log('🖼️ Reference Image Path (normalized):', normalizedPath);

                        referenceComparison = {
                            overallSimilarity: evaluation.debug_info.similarity,
                            referenceId: reference._id,
                            confidence: evaluation.debug_info.similarity > 0.8 ? 'HIGH' :
                                evaluation.debug_info.similarity > 0.5 ? 'MEDIUM' : 'LOW',
                            referenceName: reference.product_id?.product_name,
                            referenceImage: normalizedPath,
                            details: {
                                colorMatch: evaluation.debug_info.similarity,
                                logoMatch: evaluation.debug_info.similarity,
                                textMatch: evaluation.debug_info.similarity
                            }
                        };
                    }
                }

                const history = new ScanHistory({
                    tenant_id: scanJob.tenant_id,
                    user_id: scanJob.user_id,
                    product_id: scanJob.product_id,
                    scan_type: scanJob.scan_type,
                    image_path: image_path.replace(/\\/g, '/'), // Normalize path
                    status: status,
                    risk_score: riskScore,
                    flags_json: flags,
                    vision_used: visionResult.dataSource === 'CLOUD_VISION_API',
                    reference_comparison: referenceComparison ? {
                        similarity: referenceComparison.overallSimilarity,
                        referenceId: referenceComparison.referenceId,
                        confidence: referenceComparison.confidence,
                        referenceName: referenceComparison.referenceName,
                        referenceImage: referenceComparison.referenceImage,
                        details: referenceComparison.details
                    } : undefined
                });
                await history.save();

                scanJob.status = 'COMPLETED';
                await scanJob.save();

                // Update Usage (skip for system admins)
                if (scanJob.tenant_id) {
                    await incrementUsage(scanJob.tenant_id, scanJob.scan_type);
                }
                console.log('✅ Scan processing completed');

            } catch (err) {
                console.error("❌ Scan processing failed", err);
                scanJob.status = 'FAILED';
                scanJob.error_message = err.message;
                await scanJob.save();
            }
        }, 2000); // 2 seconds delay


        console.log('📤 Sending response to client');
        res.status(201).json({ message: 'Scan submitted successfully', jobId: scanJob._id });
    } catch (error) {
        console.error('❌ Scan submit error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Scan Result (Polling)
router.get('/job/:id', verifyToken, async (req, res) => {
    try {
        const job = await ScanJob.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.status === 'COMPLETED') {
            // Find the history record
            const history = await ScanHistory.findOne({
                user_id: req.user.id,
                image_path: job.image_path
            }).sort({ createdAt: -1 });

            return res.json({ status: job.status, result: history });
        }

        res.json({ status: job.status });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Scan History
router.get('/history', verifyToken, async (req, res) => {
    try {
        const history = await ScanHistory.find({ tenant_id: req.user.tenant_id })
            .sort({ createdAt: -1 })
            .populate('product_id', 'product_name brand')
            .populate('user_id', 'fullName');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// === TRAINING VERIFICATION ENDPOINTS ===

/**
 * Verify a scan result (user confirms or overrides)
 * POST /api/scan/verify/:id
 */
router.post('/verify/:id', verifyToken, async (req, res) => {
    try {
        const { override, notes } = req.body; // override: 'GENUINE' or 'FAKE'
        const { verifyScan } = require('../services/trainingService');

        const result = await verifyScan(req.params.id, req.user.id, override, notes);

        res.json(result);
    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * Get training statistics
 * GET /api/scan/training-stats
 */
router.get('/training-stats', verifyToken, async (req, res) => {
    try {
        const { getTrainingStats } = require('../services/trainingService');

        // Only admins and managers can see tenant-wide stats
        const canViewTenantStats = ['system_admin', 'tenant_admin', 'manager'].includes(req.user.role);
        const tenantId = canViewTenantStats ? req.user.tenant_id : null;

        const stats = await getTrainingStats(tenantId);

        res.json(stats);
    } catch (error) {
        console.error('❌ Training stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
