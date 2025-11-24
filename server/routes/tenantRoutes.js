// Tenant routes
const express = require('express');
const router = express.Router();
const { verifyToken, isSystemAdmin } = require('../middleware/authMiddleware');
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const TenantPlan = require('../models/TenantPlan');
const User = require('../models/User');

// --- Tenant Management (System Admin) ---

// Get all tenants
router.get('/', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new tenant
router.post('/', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { name, code, domain, plan } = req.body;
        const existingTenant = await Tenant.findOne({ code });
        if (existingTenant) {
            return res.status(400).json({ message: 'Tenant code already exists' });
        }
        const newTenant = new Tenant({ name, code, domain, plan });
        await newTenant.save();
        res.status(201).json(newTenant);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a tenant
router.put('/:id', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { name, code, status, domain, plan } = req.body;
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        if (code && code !== tenant.code) {
            const existingTenant = await Tenant.findOne({ code });
            if (existingTenant) {
                return res.status(400).json({ message: 'Tenant code already exists' });
            }
        }
        tenant.name = name || tenant.name;
        tenant.code = code || tenant.code;
        tenant.status = status || tenant.status;
        tenant.domain = domain !== undefined ? domain : tenant.domain;
        tenant.plan = plan !== undefined ? plan : tenant.plan;
        await tenant.save();
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a tenant
router.delete('/:id', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const tenant = await Tenant.findByIdAndDelete(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign Plan to Tenant
router.post('/assign-plan', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { tenant_id, plan_id, billing_cycle } = req.body;
        const tenant = await Tenant.findById(tenant_id);
        const plan = await Plan.findById(plan_id);
        if (!tenant || !plan) {
            return res.status(404).json({ message: 'Tenant or Plan not found' });
        }
        const tenantPlan = new TenantPlan({ tenant_id, plan_id, billing_cycle, start_date: new Date() });
        await tenantPlan.save();
        res.json({ message: 'Plan assigned successfully', tenantPlan });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Plan Management (System Admin) ---

// Get all plans
router.get('/plans', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a plan
router.post('/plans', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { name, description, local_quota_per_month, high_quota_per_month, price_per_month } = req.body;
        const newPlan = new Plan({ name, description, local_quota_per_month, high_quota_per_month, price_per_month });
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
