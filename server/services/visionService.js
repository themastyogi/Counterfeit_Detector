const vision = require('@google-cloud/vision');
const path = require('path');

// Initialize Vision API client
let visionClient = null;

// Try to initialize with service account if available
try {
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    console.log('🔍 Checking for Cloud Vision credentials...');
    console.log('   Path from env:', keyFilePath);

    if (keyFilePath && require('fs').existsSync(keyFilePath)) {
        console.log('   ✅ Credentials file found!');
        visionClient = new vision.ImageAnnotatorClient({
            keyFilename: keyFilePath
        });
        console.log('✅ Google Cloud Vision API initialized successfully!');
    } else {
        console.log('   ❌ Credentials file not found at:', keyFilePath);
        console.log('⚠️  Cloud Vision API not configured, using mock data');
    }
} catch (error) {
    console.log('❌ Cloud Vision API initialization error:', error.message);
    console.log('⚠️  Falling back to mock data');
}

// Mock Cloud Vision Response (fallback)
const getMockAnalysis = (filename) => {
    const random = Math.random();

    return {
        labels: [
            { description: 'Currency', score: 0.95 },
            { description: 'Paper', score: 0.89 },
            { description: 'Document', score: 0.82 },
            { description: 'Money', score: 0.78 }
        ],
        safeSearch: {
            adult: 'VERY_UNLIKELY',
            spoof: random > 0.7 ? 'POSSIBLE' : 'VERY_UNLIKELY',
            medical: 'VERY_UNLIKELY',
            violence: 'VERY_UNLIKELY',
            racy: 'UNLIKELY'
        },
        textDetection: {
            text: 'RESERVE BANK OF INDIA\n500\nFIVE HUNDRED RUPEES',
            confidence: 0.92
        },
        imageProperties: {
            dominantColors: [
                { color: '#1a5f3c', score: 0.45, pixelFraction: 0.35 },
                { color: '#e8e8e8', score: 0.30, pixelFraction: 0.25 },
                { color: '#2d2d2d', score: 0.25, pixelFraction: 0.20 }
            ]
        }
    };
};

// Analyze image with Cloud Vision API
const analyzeImage = async (imagePath) => {
    try {
        // If Cloud Vision is configured, use it
        if (visionClient) {
            console.log('🔵 Using REAL Google Cloud Vision API');
            const [result] = await visionClient.annotateImage({
                image: { source: { filename: imagePath } },
                features: [
                    { type: 'LABEL_DETECTION', maxResults: 10 },
                    { type: 'LOGO_DETECTION', maxResults: 5 },
                    { type: 'TEXT_DETECTION' },
                    { type: 'SAFE_SEARCH_DETECTION' },
                    { type: 'IMAGE_PROPERTIES' }
                ]
            });

            return {
                dataSource: 'CLOUD_VISION_API', // Indicator
                labels: result.labelAnnotations || [],
                logos: result.logoAnnotations || [],
                safeSearch: result.safeSearchAnnotation || {},
                textDetection: {
                    text: result.fullTextAnnotation?.text || '',
                    confidence: result.fullTextAnnotation?.pages?.[0]?.confidence || 0
                },
                imageProperties: {
                    dominantColors: result.imagePropertiesAnnotation?.dominantColors?.colors || []
                }
            };
        } else {
            // Fallback to mock data
            console.log('🟡 Using MOCK data (Cloud Vision not configured)');
            return {
                dataSource: 'MOCK_FALLBACK', // Indicator
                ...getMockAnalysis(path.basename(imagePath))
            };
        }
    } catch (error) {
        console.error('Cloud Vision API error:', error.message);
        // Fallback to mock on error
        console.log('🔴 Cloud Vision API failed, using MOCK data');
        return {
            dataSource: 'MOCK_FALLBACK_ERROR', // Indicator
            ...getMockAnalysis(path.basename(imagePath))
        };
    }
};

module.exports = { analyzeImage };
