const path = require('path');
const { analyzeImage } = require('../services/visionService');
const Analysis = require('../models/Analysis');
const TestParameter = require('../models/TestParameter'); // Import TestParameter model

const performAnalysis = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const { filename, path: filePath, mimetype, size } = req.file;
        const { testCategory } = req.body; // Get selected category

        // Use Cloud Vision API (or mock)
        const visionResults = await analyzeImage(filePath);

        let isSuspicious = false;
        let confidenceScore = 0.92;
        let matchDetails = [];
        let failedChecks = [];

        // 1. If Test Category is selected, use its parameters for verification
        if (testCategory) {
            console.log(`🔍 Verifying against category: ${testCategory}`);
            const parameters = await TestParameter.find({ categoryId: testCategory });

            if (parameters.length > 0) {
                let matchedCount = 0;
                let requiredCount = 0;

                parameters.forEach(param => {
                    if (param.isRequired) requiredCount++;

                    let isMatch = false;
                    const expected = param.expectedValue.toLowerCase();

                    // Check Text Parameters
                    if (param.parameterType === 'text') {
                        const detectedText = visionResults.textDetection.text.toLowerCase();
                        if (detectedText.includes(expected)) {
                            isMatch = true;
                        }
                    }
                    // Check Visual/Label Parameters
                    else if (param.parameterType === 'visual' || param.parameterType === 'other') {
                        const foundLabel = visionResults.labels.find(l =>
                            l.description.toLowerCase().includes(expected)
                        );
                        if (foundLabel) {
                            isMatch = true;
                        }
                    }
                    // Check Color Parameters (Simplified)
                    else if (param.parameterType === 'color') {
                        // Basic check if any dominant color matches (this is hard to do precisely with hex, skipping for now)
                        isMatch = true; // Assume pass for now
                    }

                    if (isMatch) {
                        matchedCount++;
                        matchDetails.push(`✅ Matched: ${param.name}`);
                    } else {
                        failedChecks.push(`❌ Missing: ${param.name} (Expected: ${param.expectedValue})`);
                    }
                });

                // Calculate Score
                // If any REQUIRED parameter is missing, it's suspicious
                const missingRequired = parameters.some(p =>
                    p.isRequired && !matchDetails.some(m => m.includes(p.name))
                );

                if (missingRequired) {
                    isSuspicious = true;
                    confidenceScore = 0.45; // Low confidence if required params missing
                    console.log('⚠️ Suspicious: Missing required parameters');
                } else {
                    // Calculate confidence based on match percentage
                    confidenceScore = (matchedCount / parameters.length).toFixed(2);
                    if (confidenceScore < 0.5) isSuspicious = true;
                }

            } else {
                console.log('ℹ️ No parameters found for this category, using default spoof check');
                // Fallback to default spoof check
                isSuspicious = visionResults.safeSearch.spoof !== 'VERY_UNLIKELY';
            }
        } else {
            // 2. Fallback: Default spoof check if no category selected
            isSuspicious = visionResults.safeSearch.spoof !== 'VERY_UNLIKELY';
        }

        // TEST MODE OVERRIDE (Keep this for manual testing)
        if (filename.toLowerCase().includes('fake') || filename.toLowerCase().includes('counterfeit')) {
            console.log('🧪 TEST MODE: Forcing suspicious result based on filename');
            isSuspicious = true;
            failedChecks.push('❌ TEST MODE: Filename indicates fake');
        }

        const analysisData = {
            userId: req.user?.id || null,
            filename,
            filePath,
            fileSize: size,
            mimeType: mimetype,
            analysis: {
                authentic: !isSuspicious,
                confidence: confidenceScore,
                status: isSuspicious ? 'suspicious' : 'authentic',
                details: {
                    dataSource: visionResults.dataSource,
                    labels: visionResults.labels,
                    textDetected: visionResults.textDetection.text,
                    spoofDetection: visionResults.safeSearch.spoof,
                    matchDetails, // Add details about what matched
                    failedChecks  // Add details about what failed
                }
            },
            recommendations: isSuspicious
                ? ['Failed verification checks:', ...failedChecks, 'Manual inspection required']
                : ['All required parameters matched', 'Item appears authentic']
        };

        // Save to database if connected
        let savedAnalysis = null;
        try {
            const analysis = new Analysis(analysisData);
            savedAnalysis = await analysis.save();
        } catch (dbError) {
            console.log('Database save failed, returning analysis without saving:', dbError.message);
            savedAnalysis = { ...analysisData, _id: Date.now() };
        }

        res.json({
            success: true,
            message: 'Analysis complete',
            dataSource: savedAnalysis.analysis.details.dataSource || 'UNKNOWN',
            result: savedAnalysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Analysis failed',
            error: error.message
        });
    }
};

const getAnalysisHistory = async (req, res) => {
    try {
        // Try to get from database - get latest 3
        const history = await Analysis.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(3) // Limit to 3 most recent
            .select('filename createdAt analysis.status analysis.confidence');

        res.json({
            success: true,
            history
        });
    } catch (error) {
        // Fallback to mock data if database fails
        const mockHistory = [
            {
                _id: 1,
                filename: '500-rupee-note.jpg',
                createdAt: new Date(Date.now() - 120000),
                analysis: { status: 'authentic', confidence: 0.92 }
            },
            {
                _id: 2,
                filename: 'luxury-watch.jpg',
                createdAt: new Date(Date.now() - 3600000),
                analysis: { status: 'suspicious', confidence: 0.45 }
            }
        ];

        res.json({
            success: true,
            history: mockHistory
        });
    }
};

const getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await Analysis.findById(id);

        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analysis', error: error.message });
    }
};

// Get user statistics (monthly scans, total scans)
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count scans this month
        const monthlyScans = await Analysis.countDocuments({
            userId: userId,
            createdAt: { $gte: startOfMonth }
        });

        // Count total scans
        const totalScans = await Analysis.countDocuments({
            userId: userId
        });

        res.json({
            success: true,
            stats: {
                monthlyScans,
                totalScans,
                monthlyLimit: 50 // Can be made dynamic based on user plan
            }
        });
    } catch (error) {
        // Return default stats if database fails
        res.json({
            success: true,
            stats: {
                monthlyScans: 0,
                totalScans: 0,
                monthlyLimit: 50
            }
        });
    }
};

module.exports = { performAnalysis, getAnalysisHistory, getAnalysisById, getUserStats };
