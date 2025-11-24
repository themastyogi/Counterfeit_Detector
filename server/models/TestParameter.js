const mongoose = require('mongoose');

const testParameterSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCategory',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    parameterType: {
        type: String,
        enum: ['visual', 'text', 'color', 'pattern', 'other'],
        default: 'visual'
    },
    expectedValue: {
        type: String,
        required: true
    },
    isRequired: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries by category
testParameterSchema.index({ categoryId: 1 });

module.exports = mongoose.model('TestParameter', testParameterSchema);
