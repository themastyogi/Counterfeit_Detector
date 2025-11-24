const PlanUsage = require('../models/PlanUsage');
const TenantPlan = require('../models/TenantPlan');
const Plan = require('../models/Plan');

const checkQuota = async (tenantId, scanType) => {
    try {
        // 1. Get Active Plan for Tenant
        const tenantPlan = await TenantPlan.findOne({
            tenant_id: tenantId,
            start_date: { $lte: new Date() },
            $or: [{ end_date: null }, { end_date: { $gte: new Date() } }]
        }).populate('plan_id');

        if (!tenantPlan) {
            throw new Error('No active plan found for this tenant');
        }

        const plan = tenantPlan.plan_id;

        // 2. Get Current Usage Record
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        let usage = await PlanUsage.findOne({
            tenant_id: tenantId,
            period_start: { $gte: startOfMonth },
            period_end: { $lte: endOfMonth }
        });

        if (!usage) {
            usage = new PlanUsage({
                tenant_id: tenantId,
                period_start: startOfMonth,
                period_end: endOfMonth,
                local_used: 0,
                high_used: 0
            });
            await usage.save();
        }

        // 3. Check Limits
        if (scanType === 'AI_VISION') {
            if (usage.high_used >= plan.high_quota_per_month) {
                return { allowed: false, message: 'AI Vision scan quota exceeded' };
            }
        } else {
            // Internal / Local
            if (usage.local_used >= plan.local_quota_per_month) {
                return { allowed: false, message: 'Local scan quota exceeded' };
            }
        }

        return { allowed: true, usageRecord: usage };
    } catch (error) {
        console.error('Quota check error:', error);
        return { allowed: false, message: error.message };
    }
};

const incrementUsage = async (tenantId, scanType) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const update = scanType === 'AI_VISION'
            ? { $inc: { high_used: 1 } }
            : { $inc: { local_used: 1 } };

        await PlanUsage.findOneAndUpdate(
            {
                tenant_id: tenantId,
                period_start: { $gte: startOfMonth },
                period_end: { $lte: endOfMonth }
            },
            update,
            { new: true, upsert: true } // Create if not exists (though checkQuota should have created it)
        );
    } catch (error) {
        console.error('Usage increment error:', error);
    }
};

module.exports = { checkQuota, incrementUsage };
