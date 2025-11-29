const mongoose = require('mongoose');

const productMasterSchema = new mongoose.Schema({
    tenant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        trim: true
    },
    product_name: {
        type: String,
        required: true,
        trim: true
    },
    expected_logo_text: {
        type: String,
        trim: true
    },
    expected_domain: {
        type: String,
        trim: true
    },
    valid_batch_pattern: {
        type: String,
        trim: true
    },
    metadata_json: {
        type: Map,
        of: String
    },
    is_global: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index to ensure unique SKU per tenant
productMasterSchema.index({ tenant_id: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('ProductMaster', productMasterSchema);
