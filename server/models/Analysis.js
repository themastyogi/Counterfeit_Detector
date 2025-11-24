const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Test Configuration Fields
    testName: {
        type: String,
        default: 'Quick Test'
    },
    testCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCategory'
    },
    testMethod: {
        type: String,
        enum: ['local', 'cloud'],
        default: 'cloud'
    },
    masterDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterData'
    },
    testResult: {
        type: String,
        enum: ['pass', 'fail', 'pending'],
        default: 'pending'
    },
    testedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // File Information
    filename: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    mimeType: {
        type: String
    },
    // Analysis Results
    analysis: {
        authentic: Boolean,
        confidence: Number,
        status: {
            type: String,
            enum: ['authentic', 'suspicious', 'counterfeit']
        },
        details: {
            dataSource: String,
            labels: Array,
            textDetected: String,
            dominantColors: Array,
            spoofDetection: String
        }
    },
    recommendations: [String]
}, {
    timestamps: true
});

// Indexes for faster queries
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ testCategory: 1 });
analysisSchema.index({ testMethod: 1 });
analysisSchema.index({ testResult: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);
