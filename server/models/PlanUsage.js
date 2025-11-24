const mongoose = require('mongoose');

const planUsageSchema = new mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    period_start: {
        type: Date,
        required: true
    },
    period_end: {
        type: Date,
        required: true
    },
    local_used: {
        type: Number,
        default: 0
    },
    high_used: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PlanUsage', planUsageSchema);
