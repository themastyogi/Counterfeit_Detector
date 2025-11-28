const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');

const checkFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            // System admins bypass feature checks
            if (req.user.role === 'system_admin') {
                return next();
            }

            const tenantId = req.user.tenant_id;
            if (!tenantId) {
                return res.status(403).json({ message: 'No tenant associated with user' });
            }

            const tenant = await Tenant.findById(tenantId);
            if (!tenant) {
                return res.status(404).json({ message: 'Tenant not found' });
            }

            // Find the plan details
            // Assuming tenant.plan stores the plan name string as per Tenant model
            const plan = await Plan.findOne({ name: tenant.plan });

            if (!plan) {
                // Fallback for legacy data or missing plans - deny access by default
                return res.status(403).json({
                    message: 'Plan information not found. Please contact support.',
                    upgradeRequired: true
                });
            }

            if (plan.features && plan.features[featureName]) {
                next();
            } else {
                return res.status(403).json({
                    message: `Your current plan (${plan.name}) does not include the ${featureName} feature. Please upgrade to access this feature.`,
                    upgradeRequired: true,
                    feature: featureName
                });
            }
        } catch (error) {
            console.error('Feature check error:', error);
            return res.status(500).json({ message: 'Server error checking plan features' });
        }
    };
};

module.exports = { checkFeature };
