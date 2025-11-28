const mongoose = require('mongoose');

const ProductReferenceSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMaster',
        required: true
    },
    reference_image_path: {
        type: String,
        required: true
    },
    // Visual fingerprint for comparison
    fingerprint: {
        // Dominant colors (for quick color matching)
        dominantColors: [{
            color: String,
            score: Number,
            pixelFraction: Number
        }],
        // Logo detection results from reference image
        logos: [{
            description: String,
            score: Number,
            boundingBox: Object
        }],
        // Text patterns from reference
        textPatterns: {
            text: String,
            confidence: Number
        },
        // Image properties
        imageProperties: {
            width: Number,
            height: Number,
            aspectRatio: Number
        }
    },
    // Metadata
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster lookups
ProductReferenceSchema.index({ product_id: 1, is_active: 1 });

module.exports = mongoose.model('ProductReference', ProductReferenceSchema);
