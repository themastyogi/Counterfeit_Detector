const mongoose = require('mongoose');

const TestRuleSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMaster',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    is_default: {
        type: Boolean,
        default: false
    },
    // Rules configuration
    rules: {
        use_logo_check: { type: Boolean, default: false },
        use_generic_labels: { type: Boolean, default: false },
        required_identifiers: [{ type: String }],
        identifier_patterns: { type: Map, of: String }
    },
    // Weights configuration (0-100)
    weights: {
        type: Map,
        of: Number,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one default per product
TestRuleSchema.index({ product_id: 1, is_default: 1 }, { unique: true, partialFilterExpression: { is_default: true } });

module.exports = mongoose.model('TestRule', TestRuleSchema);
