// Reference Comparison Service
// Compares scanned images against reference images of genuine products
const { analyzeImage } = require('./visionService');

/**
 * Calculate color similarity between two color arrays
 */
function calculateColorSimilarity(colors1, colors2) {
    if (!colors1 || !colors2 || colors1.length === 0 || colors2.length === 0) {
        return 0;
    }

    // Compare dominant colors
    let totalSimilarity = 0;
    let comparisons = 0;

    for (const color1 of colors1.slice(0, 3)) { // Top 3 colors
        for (const color2 of colors2.slice(0, 3)) {
            const similarity = compareColors(color1.color, color2.color);
            totalSimilarity += similarity * Math.min(color1.pixelFraction, color2.pixelFraction);
            comparisons++;
        }
    }

    return comparisons > 0 ? (totalSimilarity / comparisons) * 100 : 0;
}

/**
 * Compare two colors (hex or RGB object) and return similarity (0-1)
 */
function compareColors(c1, c2) {
    if (!c1 || !c2) return 0;

    // Convert both to RGB objects
    const rgb1 = toRgb(c1);
    const rgb2 = toRgb(c2);

    if (!rgb1 || !rgb2) return 0;

    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    // Normalize to 0-1 (max distance in RGB is ~441)
    return 1 - (distance / 441);
}

/**
 * Convert color input (hex string or RGB object) to standardized RGB object
 */
function toRgb(input) {
    // If it's already an RGB object with r,g,b or red,green,blue
    if (typeof input === 'object') {
        if (input.r !== undefined) return input;
        if (input.red !== undefined) return { r: input.red, g: input.green, b: input.blue };
        // Handle Cloud Vision structure { color: { red, green, blue } }
        if (input.color) return toRgb(input.color);
        return null;
    }

    // If it's a hex string
    if (typeof input === 'string') {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    return null;
}

/**
 * Calculate logo similarity
 */
function calculateLogoSimilarity(scannedLogos, referenceLogos, brandName, scannedText) {
    // 1. Try Visual Logo Matching (Google Vision)
    if (scannedLogos && referenceLogos && scannedLogos.length > 0 && referenceLogos.length > 0) {
        // Check if same logos are detected
        const scannedBrands = scannedLogos.map(l => l.description.toLowerCase());
        const referenceBrands = referenceLogos.map(l => l.description.toLowerCase());

        const matchedBrands = scannedBrands.filter(brand =>
            referenceBrands.some(refBrand =>
                brand.includes(refBrand) || refBrand.includes(brand)
            )
        );

        if (matchedBrands.length > 0) {
            // Calculate average confidence similarity
            let totalSimilarity = 0;
            let matches = 0;

            for (const scannedLogo of scannedLogos) {
                const matchingRef = referenceLogos.find(refLogo =>
                    scannedLogo.description.toLowerCase().includes(refLogo.description.toLowerCase()) ||
                    refLogo.description.toLowerCase().includes(scannedLogo.description.toLowerCase())
                );

                if (matchingRef) {
                    const confidenceDiff = Math.abs(scannedLogo.score - matchingRef.score);
                    totalSimilarity += (1 - confidenceDiff) * 100;
                    matches++;
                }
            }

            return {
                similarity: matches > 0 ? totalSimilarity / matches : 0,
                matched: true,
                matchedBrands,
                method: 'VISUAL_LOGO'
            };
        }
    }
    /**
     * Calculate text similarity
     */
    function calculateTextSimilarity(scannedText, referenceText) {
        if (!scannedText || !referenceText) {
            return 0;
        }

        const text1 = scannedText.text?.toLowerCase() || '';
        const text2 = referenceText.text?.toLowerCase() || '';

        if (!text1 || !text2) return 0;

        // Simple word overlap similarity
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);

        const commonWords = words1.filter(word => words2.includes(word));
        const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;

        return similarity;
    }

    /**
     * Main comparison function
     */
    function compareWithReference(visionResult, referenceFingerprint, brandName) {
        const result = {
            overallSimilarity: 0,
            colorSimilarity: 0,
            logoSimilarity: 0,
            textSimilarity: 0,
            isMatch: false,
            confidence: 'LOW',
            details: {}
        };

        // Compare colors
        const colorSim = calculateColorSimilarity(
            visionResult.imageProperties?.dominantColors || [],
            referenceFingerprint.dominantColors || []
        );
        result.colorSimilarity = colorSim;

        // Compare logos (with text fallback)
        const logoComparison = calculateLogoSimilarity(
            visionResult.logos || [],
            referenceFingerprint.logos || [],
            brandName,
            visionResult.textDetection?.text || ''
        );
        result.logoSimilarity = logoComparison.similarity;
        result.details.logoMatched = logoComparison.matched;
        result.details.matchedBrands = logoComparison.matchedBrands;
        result.details.logoMethod = logoComparison.method;

        // Compare text
        const textSim = calculateTextSimilarity(
            visionResult.textDetection || {},
            referenceFingerprint.textPatterns || {}
        );
        result.textSimilarity = textSim;

        // Calculate overall similarity (weighted average)
        // Default weights: Logo (50%), Color (30%), Text (20%)
        let wLogo = 0.5;
        let wColor = 0.3;
        let wText = 0.2;

        // Dynamic weighting: If reference has no logos, redistribute logo weight
        if (!referenceFingerprint.logos || referenceFingerprint.logos.length === 0) {
            wLogo = 0;
            wColor = 0.4; // Increase color weight
            wText = 0.6;  // Increase text weight significantly as it's a strong indicator
        }

        result.overallSimilarity =
            (result.logoSimilarity * wLogo) +
            (result.colorSimilarity * wColor) +
            (result.textSimilarity * wText);

        // Determine if it's a match
        if (result.overallSimilarity >= 75) {
            result.isMatch = true;
            result.confidence = 'HIGH';
        } else if (result.overallSimilarity >= 60) {
            result.isMatch = true;
            result.confidence = 'MEDIUM';
        } else if (result.overallSimilarity >= 45) {
            result.isMatch = false;
            result.confidence = 'MEDIUM';
        } else {
            result.isMatch = false;
            result.confidence = 'LOW';
        }

        return result;
    }

    /**
     * Compare against multiple references and return best match
     */
    function compareWithMultipleReferences(visionResult, references) {
        if (!references || references.length === 0) {
            return null;
        }

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const reference of references) {
            const comparison = compareWithReference(visionResult, reference.fingerprint);

            if (comparison.overallSimilarity > highestSimilarity) {
                highestSimilarity = comparison.overallSimilarity;
                bestMatch = {
                    ...comparison,
                    referenceId: reference._id,
                    referencePath: reference.reference_image_path
                };
            }
        }

        return bestMatch;
    }

    /**
     * Adjust risk score based on reference comparison
     */
    function adjustRiskScoreWithReference(baseRiskScore, comparisonResult) {
        if (!comparisonResult) {
            // No reference available, add uncertainty penalty
            return {
                adjustedScore: baseRiskScore + 10,
                adjustment: 10,
                reason: 'No reference image available for comparison'
            };
        }

        let adjustment = 0;
        let reason = '';

        if (comparisonResult.isMatch) {
            // Good match with reference - reduce risk significantly
            if (comparisonResult.confidence === 'HIGH') {
                adjustment = -30;
                reason = `High similarity (${comparisonResult.overallSimilarity.toFixed(0)}%) to genuine reference`;
            } else {
                adjustment = -15;
                reason = `Medium similarity (${comparisonResult.overallSimilarity.toFixed(0)}%) to genuine reference`;
            }
        } else {
            // Poor match with reference - increase risk
            if (comparisonResult.confidence === 'LOW') {
                adjustment = 40;
                reason = `Low similarity (${comparisonResult.overallSimilarity.toFixed(0)}%) to genuine reference - likely counterfeit`;
            } else {
                adjustment = 25;
                reason = `Below-average similarity (${comparisonResult.overallSimilarity.toFixed(0)}%) to genuine reference`;
            }
        }

        return {
            adjustedScore: Math.max(0, Math.min(100, baseRiskScore + adjustment)),
            adjustment,
            reason,
            details: comparisonResult
        };
    }

    /**
     * Extract fingerprint from an image using Vision API
     */
    async function extractFingerprint(imagePath) {
        try {
            const analysis = await analyzeImage(imagePath);

            // Helper function to convert RGB object to hex string
            const rgbToHex = (colorObj) => {
                if (!colorObj) return '#000000';

                // Handle both formats: {red, green, blue} and {color: {red, green, blue}}
                const rgb = colorObj.color || colorObj;

                const r = Math.round(rgb.red || 0);
                const g = Math.round(rgb.green || 0);
                const b = Math.round(rgb.blue || 0);

                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
            };

            // Transform analysis into a standardized fingerprint structure
            const dominantColors = (analysis.imageProperties?.dominantColors || []).map(colorData => ({
                color: rgbToHex(colorData),
                score: colorData.score || 0,
                pixelFraction: colorData.pixelFraction || 0
            }));

            return {
                dominantColors,
                logos: analysis.logos || [],
                textPatterns: analysis.textDetection || {},
                labels: analysis.labels || [],
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error extracting fingerprint:', error);
            throw error;
        }
    }

    module.exports = {
        extractFingerprint,
        compareWithReference,
        compareWithMultipleReferences,
        adjustRiskScoreWithReference,
        calculateColorSimilarity,
        calculateLogoSimilarity,
        calculateTextSimilarity
    };
