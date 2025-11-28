// Training Service
// Handles user verification and learning from feedback

const ScanHistory = require('../models/ScanHistory');

/**
 * Verify a scan result (user confirms or overrides)
 */
async function verifyScan(scanId, userId, override, notes) {
    try {
        const scan = await ScanHistory.findById(scanId);

        if (!scan) {
            throw new Error('Scan not found');
        }

        scan.user_verified = true;
        scan.user_override = override; // 'GENUINE' or 'FAKE'
        scan.verification_notes = notes;
        scan.verified_at = new Date();
        scan.verified_by = userId;

        await scan.save();

        return {
            success: true,
            message: 'Scan verified successfully',
            scan
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Get training statistics
 */
async function getTrainingStats(tenantId) {
    try {
        const query = tenantId ? { tenant_id: tenantId } : {};

        const totalScans = await ScanHistory.countDocuments(query);
        const verifiedScans = await ScanHistory.countDocuments({ ...query, user_verified: true });

        const overrides = await ScanHistory.aggregate([
            { $match: { ...query, user_verified: true, user_override: { $ne: null } } },
            { $group: { _id: '$user_override', count: { $sum: 1 } } }
        ]);

        const accuracyData = await ScanHistory.aggregate([
            { $match: { ...query, user_verified: true } },
            {
                $project: {
                    correct: {
                        $cond: [
                            {
                                $or: [
                                    // System said genuine, user confirmed genuine
                                    {
                                        $and: [
                                            { $eq: ['$status', 'LIKELY_GENUINE'] },
                                            { $eq: ['$user_override', 'GENUINE'] }
                                        ]
                                    },
                                    // System said fake, user confirmed fake
                                    {
                                        $and: [
                                            { $in: ['$status', ['SUSPICIOUS', 'HIGH_RISK']] },
                                            { $eq: ['$user_override', 'FAKE'] }
                                        ]
                                    },
                                    // User didn't override (system was correct)
                                    { $eq: ['$user_override', null] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalVerified: { $sum: 1 },
                    correct: { $sum: '$correct' }
                }
            }
        ]);

        const accuracy = accuracyData.length > 0
            ? (accuracyData[0].correct / accuracyData[0].totalVerified) * 100
            : 0;

        return {
            totalScans,
            verifiedScans,
            verificationRate: totalScans > 0 ? (verifiedScans / totalScans) * 100 : 0,
            overrides: overrides.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            accuracy: accuracy.toFixed(2)
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Get verified scans for training (machine learning)
 */
async function getTrainingData(tenantId, productId = null) {
    try {
        const query = {
            user_verified: true,
            ...(tenantId && { tenant_id: tenantId }),
            ...(productId && { product_id: productId })
        };

        const trainingData = await ScanHistory.find(query)
            .select('risk_score flags_json user_override status reference_comparison')
            .lean();

        return trainingData;
    } catch (error) {
        throw error;
    }
}

/**
 * Calculate adjusted risk based on training data
 */
function calculateTrainingAdjustment(currentRiskScore, productId, trainingData) {
    if (!trainingData || trainingData.length < 5) {
        // Not enough training data
        return {
            adjustment: 0,
            reason: 'Insufficient training data'
        };
    }

    // Calculate average risk scores for genuine vs fake products
    const genuineScans = trainingData.filter(t =>
        t.user_override === 'GENUINE' || (t.status === 'LIKELY_GENUINE' && !t.user_override)
    );
    const fakeScans = trainingData.filter(t =>
        t.user_override === 'FAKE' || (t.status !== 'LIKELY_GENUINE' && !t.user_override)
    );

    if (genuineScans.length === 0 || fakeScans.length === 0) {
        return {
            adjustment: 0,
            reason: 'Need both genuine and fake examples'
        };
    }

    const avgGenuineRisk = genuineScans.reduce((sum, s) => sum + s.risk_score, 0) / genuineScans.length;
    const avgFakeRisk = fakeScans.reduce((sum, s) => sum + s.risk_score, 0) / fakeScans.length;

    // If current risk is closer to genuine average, reduce risk
    // If closer to fake average, increase risk
    const distanceToGenuine = Math.abs(currentRiskScore - avgGenuineRisk);
    const distanceToFake = Math.abs(currentRiskScore - avgFakeRisk);

    let adjustment = 0;
    let reason = '';

    if (distanceToGenuine < distanceToFake) {
        // Closer to genuine pattern
        adjustment = -10;
        reason = `Pattern matches ${genuineScans.length} verified genuine products`;
    } else {
        // Closer to fake pattern
        adjustment = 10;
        reason = `Pattern matches ${fakeScans.length} verified fake products`;
    }

    return { adjustment, reason };
}

module.exports = {
    verifyScan,
    getTrainingStats,
    getTrainingData,
    calculateTrainingAdjustment
};
