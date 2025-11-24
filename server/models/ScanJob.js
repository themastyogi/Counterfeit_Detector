const mongoose = require('mongoose');

const scanJobSchema = new mongoose.Schema({
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
        ref: 'ProductMaster',
        required: false  // Optional
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
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    error_message: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScanJob', scanJobSchema);
