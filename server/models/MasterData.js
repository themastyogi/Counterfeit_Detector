const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCategory',
        required: true
    },
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    parameters: [{
        parameterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestParameter',
            required: true
        },
        expectedValue: {
            type: String,
            required: true
        },
        tolerance: {
            type: Number,
            default: 10,
            min: 0,
            max: 100
        },
        criticalLevel: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium'
        }
    }],
    referenceImages: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
masterDataSchema.index({ categoryId: 1, isActive: 1 });
masterDataSchema.index({ itemName: 'text' });

module.exports = mongoose.model('MasterData', masterDataSchema);
