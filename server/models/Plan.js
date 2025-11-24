const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., 'BASIC', 'PREMIUM'
        unique: true,
        uppercase: true
    },
    description: {
        type: String
    },
    local_quota_per_month: {
        type: Number,
        required: true,
        default: 100
    },
    high_quota_per_month: {
        type: Number,
        required: true,
        default: 10
    },
    price_per_month: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
