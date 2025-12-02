const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: false  // Optional for system admins
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMaster'
    },
    scan_type: {
        type: String,
        enum: ['LOCAL', 'AI_VISION', 'AUTO'],
        required: true
    },
    image_path: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['LIKELY_GENUINE', 'SUSPICIOUS', 'HIGH_RISK', 'INDETERMINATE'],
        required: true
    },
    risk_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    flags_json: {
        type: Map,
        of: String // e.g., "Logo mismatch": "High confidence"
    },
    vision_used: {
        type: Boolean,
        default: false
    },
    vision_request_id: {
        type: String
    },
    location: {
        type: String
    },
    // Training and verification fields
    user_verified: {
        type: Boolean,
        default: false
    },
    user_override: {
        type: String,
        enum: ['GENUINE', 'FAKE', null],
        default: null
    },
    verification_notes: {
        type: String
    },
    verified_at: {
        type: Date
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Reference comparison data
    reference_comparison: {
        similarity: Number,
        referenceId: mongoose.Schema.Types.ObjectId,
        confidence: String,
        referenceName: String,
        referenceImage: String,
        details: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
