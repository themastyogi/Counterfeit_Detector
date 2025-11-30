/**
 * Scan Evaluation Engine
 * 
 * A config-driven hybrid detection system that combines:
 * 1. Reference Image Comparison (Visual)
 * 2. Master Data Verification (Rule-based)
 * 3. Cloud Vision API Analysis
 */

/**
 * Parse common identifiers from OCR text
 * @param {string} text - Full OCR text from Cloud Vision
 * @returns {Object} Parsed identifiers
 */
function parseIdentifiers(text) {
    const identifiers = {};

    if (!text) return identifiers;

    const textLower = text.toLowerCase();

    // ISBN (10 or 13 digit)
    const isbnMatch = text.match(/(?:ISBN(?:-1[03])?:?\s*)?(?=[-0-9 ]{17}|[-0-9X ]{13}|[0-9X]{10})(?:97[89][- ]?)?[0-9]{1,5}[- ]?(?:[0-9]+[- ]?){2}[0-9X]/i);
    if (isbnMatch) {
        identifiers.isbn = isbnMatch[0].replace(/[^0-9X]/gi, '');
    }

    // IMEI (15 digits)
    const imeiMatch = text.match(/\b\d{15}\b/);
    if (imeiMatch) {
        identifiers.imei = imeiMatch[0];
    }

    // Brand name extraction (look for common brand patterns)
    const brandPatterns = [
        /(?:brand|manufacturer):\s*([a-z0-9\s&]+)/i,
        /(?:made by|produced by):\s*([a-z0-9\s&]+)/i
    ];

    for (const pattern of brandPatterns) {
        const match = text.match(pattern);
        if (match) {
            identifiers.brand_name = match[1].trim();
            break;
        }
    }

    // Publisher (for books)
    const publisherMatch = text.match(/(?:publisher|published by):\s*([a-z0-9\s&]+)/i);
    if (publisherMatch) {
        identifiers.publisher = publisherMatch[1].trim();
    }

    // Model number (alphanumeric with dashes/slashes)
    const modelMatch = text.match(/(?:model|model no\.?):\s*([a-z0-9\-\/]+)/i);
    if (modelMatch) {
        identifiers.model_number = modelMatch[1].trim();
    }

    // Batch/Lot number
    const batchMatch = text.match(/(?:batch|lot)(?:\s*no\.?)?:\s*([a-z0-9\-\/]+)/i);
    if (batchMatch) {
        identifiers.batch_number = batchMatch[1].trim();
    }

    return identifiers;
}

/**
 * Determine likely category from Cloud Vision labels
 * @param {Array} labels - Array of label objects from Cloud Vision
 * @returns {string|null} Likely category
 */
function likelyCategoryFromLabels(labels) {
    if (!labels || labels.length === 0) return null;

    const categoryMapping = {
        'book': 'BOOK',
        'publication': 'BOOK',
        'mobile phone': 'MOBILE',
        'smartphone': 'MOBILE',
        'cellphone': 'MOBILE',
        'cosmetics': 'COSMETICS',
        'perfume': 'COSMETICS',
        'makeup': 'COSMETICS',
        'shoe': 'FOOTWEAR',
        'sneaker': 'FOOTWEAR',
        'footwear': 'FOOTWEAR',
        'bottle': 'BEVERAGE',
        'drink': 'BEVERAGE',
        'food': 'FOOD',
        'snack': 'FOOD'
    };

    for (const label of labels) {
        const desc = label.description.toLowerCase();
        if (categoryMapping[desc]) {
            return categoryMapping[desc];
        }
    }

    return null;
}

/**
 * Check if logo list contains the expected brand
 * @param {Array} logos - Array of logo objects from Cloud Vision
 * @param {string} brandName - Expected brand name
 * @param {number} minScore - Minimum confidence score (0-1)
 * @returns {boolean} True if brand logo found with sufficient confidence
 */
function logoContainsBrand(logos, brandName, minScore = 0.7) {
    if (!logos || logos.length === 0 || !brandName) return false;

    const brandLower = brandName.toLowerCase();

    for (const logo of logos) {
        const logoDesc = logo.description.toLowerCase();
        const score = logo.score || 0;

        if (logoDesc.includes(brandLower) && score >= minScore) {
            return true;
        }
    }

    return false;
}

/**
 * Compute image similarity (placeholder - would use actual image comparison)
 * @param {Array} scanImages - Array of scan image paths
 * @param {Array} referenceImages - Array of reference image paths
 * @returns {number} Similarity score 0-1
 */
async function computeImageSimilarity(scanImages, referenceImages, visionResult, referenceFingerprint, brandName) {
    // If we have vision result and reference fingerprint, use the advanced comparison
    if (visionResult && referenceFingerprint) {
        const { compareWithReference } = require('./referenceComparison');
        const comparison = compareWithReference(visionResult, referenceFingerprint, brandName);
        // Normalize overall similarity to 0-1 for backward compatibility where number is expected
        comparison.score = comparison.overallSimilarity / 100;
        return comparison;
    }

    // Fallback if no fingerprint available
    return { score: 0.5, overallSimilarity: 50, details: {} };
}

/**
 * Map risk score to status
 * @param {number} score - Risk score 0-100
 * @returns {string} Status: LIKELY_GENUINE, SUSPICIOUS, or HIGH_RISK
 */
function mapRiskToStatus(score) {
    if (score <= 30) return 'LIKELY_GENUINE';
    if (score <= 70) return 'SUSPICIOUS';
    return 'HIGH_RISK';
}

/**
 * Validate identifier against pattern
 * @param {string} value - Identifier value
 * @param {string} pattern - Regex pattern
 * @returns {boolean} True if valid
 */
function validatePattern(value, pattern) {
    if (!value || !pattern) return false;
    try {
        const regex = new RegExp(pattern);
        return regex.test(value);
    } catch (e) {
        console.error('Invalid regex pattern:', pattern, e);
        return false;
    }
}

/**
 * Core evaluation function
 * @param {Object} product - Product master data
 * @param {Array} scanImages - Array of scan image paths
 * @param {Object} visionResult - Cloud Vision API result
 * @param {Object} options - Options including reference_id
 * @returns {Object} Evaluation result
 */
async function evaluateScan(product, scanImages, visionResult, options = {}) {
    const result = {
        status: 'LIKELY_GENUINE',
        risk_score: 0,
        violations: [],
        used_mode: null,
        debug_info: {}
    };

    const metadata = product.metadata_json || {};
    const rules = metadata.rules || {};
    const weights = metadata.weights || {};

    // Check if rules are defined
    if (!metadata.rules || Object.keys(metadata.rules).length === 0) {
        result.violations.push({
            code: 'NO_RULES_DEFINED',
            message: 'No validation rules defined for this category',
            weight: 0
        });
        result.used_mode = 'UNDEFINED_CATEGORY';
        result.status = 'INDETERMINATE';

        // Still run universal checks
        runUniversalChecks(visionResult, result);
        return result;
    }

    // MODE 1: Reference-based comparison
    if (options.reference_id) {
        result.used_mode = 'REFERENCE_COMPARE';
        await evaluateReferenceMode(product, scanImages, visionResult, options.reference_id, result, weights);
    } else {
        // MODE 2: Hybrid Master + Cloud
        result.used_mode = 'MASTER_PLUS_CLOUD';
        await evaluateHybridMode(product, scanImages, visionResult, result, rules, weights);
    }

    // Calculate final risk score
    result.risk_score = Math.min(100, result.violations.reduce((sum, v) => sum + (v.weight || 0), 0));
    result.status = mapRiskToStatus(result.risk_score);

    return result;
}

/**
 * Evaluate using Reference Comparison mode
 */
async function evaluateReferenceMode(product, scanImages, visionResult, referenceId, result, weights) {
    const ProductReference = require('../models/ProductReference');

    try {
        const reference = await ProductReference.findById(referenceId);

        if (!reference) {
            result.violations.push({
                code: 'REFERENCE_NOT_FOUND',
                message: 'Reference image not found',
                weight: 0
            });
            return;
        }

        // Compute similarity using actual fingerprint comparison
        let similarity = 0;
        let comparisonDetails = {};

        try {
            const comparison = await computeImageSimilarity(
                scanImages,
                [reference.reference_image_path],
                visionResult,
                reference.fingerprint,
                product.brand // Pass brand name for text-based logo matching
            );

            // Handle both object and legacy number return
            if (typeof comparison === 'object') {
                similarity = comparison.score;
                comparisonDetails = comparison;
            } else {
                similarity = comparison;
            }
        } catch (simError) {
            console.error('❌ Error computing similarity:', simError);
            // Fallback to 0 to avoid crashing the entire scan
            similarity = 0;
        }

    });
} else if (similarity >= 0.70) {
    // High-Medium similarity
    result.violations.push({
        code: 'GOOD_SIMILARITY',
        message: `Good similarity to reference (${(similarity * 100).toFixed(0)}%)`,
        weight: 10 // Slight risk
    });
} else if (similarity < 0.55) {
    // Low similarity - suspicious
    const weight = weights.low_similarity || 60; // Increased from 50
    result.violations.push({
        code: 'LOW_SIMILARITY',
        message: `Low similarity to reference (${(similarity * 100).toFixed(0)}%)`,
        weight
    });
} else {
    // Medium similarity (0.55 - 0.70)
    const weight = weights.medium_similarity || 35; // Increased from 20
    result.violations.push({
        code: 'MEDIUM_SIMILARITY',
        message: `Medium similarity to reference (${(similarity * 100).toFixed(0)}%)`,
        weight
    });
}

// Still run secondary checks
runGenericChecks(product, visionResult, result, weights);

    } catch (error) {
    console.error('Reference evaluation error:', error);
    result.violations.push({
        code: 'REFERENCE_ERROR',
        message: 'Error during reference comparison',
        weight: 0
    });
}
}

/**
 * Evaluate using Hybrid Master + Cloud mode
 */
async function evaluateHybridMode(product, scanImages, visionResult, result, rules, weights) {
    // Parse identifiers from OCR
    const parsedIdentifiers = parseIdentifiers(visionResult.textDetection?.text || '');
    result.debug_info.parsed_identifiers = parsedIdentifiers;

    // Run generic checks
    runGenericChecks(product, visionResult, result, weights);

    // Run config-driven checks
    runConfigDrivenChecks(product, parsedIdentifiers, visionResult, result, rules, weights);

    // Run universal checks
    runUniversalChecks(visionResult, result);
}

/**
 * Run generic brand/category checks
 */
function runGenericChecks(product, visionResult, result, weights) {
    const parsedIdentifiers = parseIdentifiers(visionResult.textDetection?.text || '');

    // Brand mismatch check
    if (product.brand && parsedIdentifiers.brand_name) {
        const brandMatch = parsedIdentifiers.brand_name.toLowerCase().includes(product.brand.toLowerCase()) ||
            product.brand.toLowerCase().includes(parsedIdentifiers.brand_name.toLowerCase());

        if (!brandMatch) {
            const weight = weights.brand_mismatch || 20;
            result.violations.push({
                code: 'BRAND_MISMATCH',
                message: `Brand mismatch: detected "${parsedIdentifiers.brand_name}", expected "${product.brand}"`,
                weight
            });
        }
    }

    // Category mismatch check
    const likelyCategory = likelyCategoryFromLabels(visionResult.labels || []);
    if (likelyCategory && product.category && likelyCategory !== product.category) {
        const weight = weights.category_mismatch || 20;
        result.violations.push({
            code: 'CATEGORY_MISMATCH',
            message: `Category mismatch: detected "${likelyCategory}", expected "${product.category}"`,
            weight
        });
    }
}

/**
 * Run config-driven checks based on metadata_json rules
 */
function runConfigDrivenChecks(product, parsedIdentifiers, visionResult, result, rules, weights) {
    // Check required identifiers
    if (rules.required_identifiers) {
        for (const identifier of rules.required_identifiers) {
            if (!parsedIdentifiers[identifier]) {
                const weight = weights[`missing_${identifier}`] || 30;
                result.violations.push({
                    code: `MISSING_${identifier.toUpperCase()}`,
                    message: `Missing required identifier: ${identifier}`,
                    weight
                });
            }
        }
    }

    // Validate identifier patterns
    if (rules.identifier_patterns) {
        for (const [identifier, pattern] of Object.entries(rules.identifier_patterns)) {
            if (parsedIdentifiers[identifier]) {
                const isValid = validatePattern(parsedIdentifiers[identifier], pattern);
                if (!isValid) {
                    const weight = weights[`invalid_${identifier}`] || 40;
                    result.violations.push({
                        code: `INVALID_${identifier.toUpperCase()}`,
                        message: `Invalid ${identifier} format: ${parsedIdentifiers[identifier]}`,
                        weight
                    });
                }
            }
        }
    }

    // Logo check (if enabled)
    if (rules.use_logo_check && product.brand) {
        const hasLogo = logoContainsBrand(visionResult.logos || [], product.brand);
        if (!hasLogo) {
            const weight = weights.logo_missing || 40;
            result.violations.push({
                code: 'LOGO_MISSING',
                message: `Expected ${product.brand} logo not detected`,
                weight
            });
        }
    }
}

/**
 * Run universal safety checks (watermarks, text quality, etc.)
 */
function runUniversalChecks(visionResult, result) {
    const text = (visionResult.textDetection?.text || '').toLowerCase();

    // Watermark detection
    const watermarkPatterns = [
        'stockphoto', 'shutterstock', 'gettyimages', 'watermark',
        'dreamstime', 'istockphoto', 'alamy', 'depositphotos'
    ];

    for (const watermark of watermarkPatterns) {
        if (text.includes(watermark)) {
            result.violations.push({
                code: 'WATERMARK_DETECTED',
                message: `Stock photo watermark detected: ${watermark}`,
                weight: 70
            });
            break;
        }
    }

    // SafeSearch spoof detection
    if (visionResult.safeSearch?.spoof === 'LIKELY' || visionResult.safeSearch?.spoof === 'VERY_LIKELY') {
        result.violations.push({
            code: 'SPOOF_DETECTED',
            message: 'Image manipulation or spoofing detected',
            weight: 50
        });
    }

    // Low OCR confidence
    const confidence = visionResult.textDetection?.confidence || 1;
    if (confidence > 0 && confidence < 0.5) {
        result.violations.push({
            code: 'LOW_TEXT_QUALITY',
            message: `Very poor text quality (${(confidence * 100).toFixed(0)}% confidence)`,
            weight: 30
        });
    }
}

module.exports = {
    evaluateScan,
    parseIdentifiers,
    likelyCategoryFromLabels,
    logoContainsBrand,
    computeImageSimilarity,
    mapRiskToStatus
};
