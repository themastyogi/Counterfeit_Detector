const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const ScanJob = require('../models/ScanJob');
const ScanHistory = require('../models/ScanHistory');
console.log('📦 Product loaded:', product?.product_name);
                }

// Use NEW EVALUATION ENGINE
const evaluation = await evaluateScan(
    product || { brand: 'Unknown', category: 'Other', metadata_json: {} },
    [image_path],
    visionResult,
    { reference_id }
);
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
