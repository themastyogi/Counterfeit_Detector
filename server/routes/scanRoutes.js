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

        const { product_id, scan_type } = req.body;
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

        // Perform scan using Vision API with category validation
        console.log('🔎 Analyzing image...');
        const { analyzeImage } = require('../services/visionService');
        const { validateCategory } = require('../services/categoryValidation');
        const { analyzeAuthenticity } = require('../services/authenticityDetection');

        setTimeout(async () => {
            try {
                console.log('⚙️ Processing scan job:', scanJob._id);

                // Get Vision API analysis
                const visionResult = await analyzeImage(image_path);
                console.log('📊 Vision analysis complete');
                console.log('🔍 Data source:', visionResult.dataSource);
                console.log('📝 Detected text:', visionResult.textDetection?.text || 'No text detected');

                // Get product details for category
                let productCategory = 'Other';
                if (product_id) {
                    const product = await ProductMaster.findById(product_id);
                    if (product) {
                        productCategory = product.product_name || product.category || 'Other';
                    }
                }

                // Validate category match
                const categoryValidation = validateCategory(productCategory, visionResult.labels);
                console.log('🔍 Category validation:', categoryValidation.isMatch ? '✅ Match' : '❌ Mismatch');

                // Analyze authenticity (logo, text quality, patterns)
                const authenticityResult = analyzeAuthenticity(visionResult, productCategory, categoryValidation);
                console.log('🔐 Authenticity analysis:', authenticityResult.riskScore > 50 ? '⚠️ High risk' : '✅ Low risk');
                console.log('🚩 Flags found:', Object.keys(authenticityResult.flags));

                // Calculate risk score based on authenticity factors
                // Start with baseline risk (healthy skepticism)
                let riskScore = 20; // Baseline: not automatically genuine
                let status = 'LIKELY_GENUINE';
                const flags = {};

                // Category validation (informational only - match doesn't reduce risk)
                if (!categoryValidation.isMatch) {
                    // Category mismatch is a red flag
                    riskScore += 60;
                    flags['Category Mismatch'] = categoryValidation.reason;
                } else {
                    // Category match is just informational, doesn't affect risk
                    flags['Category Match'] = `Matched: ${categoryValidation.matchedLabels.join(', ')}`;
                }

                // Add authenticity risk score and flags (THIS IS THE MAIN DETECTION)
                riskScore += authenticityResult.riskScore;
                Object.assign(flags, authenticityResult.flags);

                // Check safe search (spoof detection)
                if (visionResult.safeSearch?.spoof === 'POSSIBLE' || visionResult.safeSearch?.spoof === 'LIKELY') {
                    riskScore += 30;
                    flags['Spoof Detection'] = 'Possible manipulation detected';
                }

                // Check if critical authenticity markers are missing
                const hasLogoCheck = authenticityResult.flags['Brand Verified'] || authenticityResult.flags['Logo Detection'];
                const hasTextCheck = authenticityResult.flags['Watermark Detected'] || authenticityResult.flags['Text Quality'];

                if (!hasLogoCheck && !hasTextCheck) {
                    riskScore += 15;
                    flags['Limited Verification'] = 'Unable to verify key authenticity markers';
                }

                // Add detected labels to flags (informational)
                flags['Detected Labels'] = visionResult.labels.slice(0, 5).map(l => l.description).join(', ');

                // Determine final status (stricter thresholds)
                if (riskScore > 60) {
                    status = 'HIGH_RISK';
                } else if (riskScore > 30) {
                    status = 'SUSPICIOUS';
                } else {
                    status = 'LIKELY_GENUINE';
                }

                const history = new ScanHistory({
                    tenant_id: scanJob.tenant_id,
                    user_id: scanJob.user_id,
                    product_id: scanJob.product_id,
                    scan_type: scanJob.scan_type,
                    image_path: scanJob.image_path,
                    status: status,
                    risk_score: Math.round(riskScore),
                    flags_json: flags,
                    vision_used: visionResult.dataSource === 'CLOUD_VISION_API'
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

module.exports = router;
