// Authenticity Detection Service
// Analyzes logos, text quality, and patterns to detect counterfeit products

// Brand-to-category mapping
const brandMapping = {
    'Smartphones': ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'Realme', 'Nokia'],
    'Tablets': ['Apple', 'Samsung', 'Microsoft', 'Amazon', 'Lenovo'],
    'Laptops': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft'],
    'Watches': ['Rolex', 'Omega', 'Tag Heuer', 'Apple', 'Samsung', 'Fossil', 'Casio', 'Seiko'],
    'Smart Watches': ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Fossil', 'Amazfit'],
    'Shoes': ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Under Armour'],
    'Sneakers': ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans'],
    'Handbags': ['Louis Vuitton', 'Gucci', 'Prada', 'Chanel', 'Hermes', 'Coach', 'Michael Kors'],
    'Sunglasses': ['Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace', 'Dior'],
    'Eyeglasses': ['Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace'],
    'Eyewear': ['Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace'],
    'Headphones': ['Sony', 'Bose', 'Beats', 'Sennheiser', 'JBL', 'Audio-Technica'],
    'Earbuds': ['Apple', 'Samsung', 'Sony', 'Bose', 'Jabra'],
    'Perfumes': ['Chanel', 'Dior', 'Gucci', 'Versace', 'Calvin Klein', 'Hugo Boss'],
    'Cosmetics': ['MAC', 'Estee Lauder', 'Chanel', 'Dior', 'Maybelline'],
    'Clothing': ['Nike', 'Adidas', 'Gucci', 'Prada', 'Zara', 'H&M'],
    'Jackets': ['North Face', 'Patagonia', 'Columbia', 'Nike', 'Adidas']
};

// Common brand name misspellings (counterfeit indicators)
const commonMisspellings = {
    'Apple': ['Appel', 'Aple', 'Appl'],
    'Nike': ['Nikee', 'Nik', 'Nyke'],
    'Adidas': ['Adiddas', 'Addidas', 'Adibas'],
    'Samsung': ['Samsang', 'Samsnug', 'Samsumg'],
    'Gucci': ['Guccci', 'Guci', 'Guchi'],
    'Louis Vuitton': ['Louis Vuiton', 'Luis Vuitton', 'Loui Vuitton'],
    'Rolex': ['Rolexx', 'Rollex', 'Rolex']
};

/**
 * Detect and verify brand logos
 */
function detectBrandLogo(visionResult, category) {
    const result = {
        riskScore: 0,
        flags: {},
        detected: false
    };

    const logos = visionResult.logos || [];
    const expectedBrands = brandMapping[category] || [];

    if (expectedBrands.length === 0) {
        // No brand expectations for this category
        return result;
    }

    if (logos.length === 0) {
        // No logo detected, but one was expected - MAJOR RED FLAG
        result.riskScore += 35; // Increased from 25
        result.flags['Logo Missing'] = `No brand logo detected (expected: ${expectedBrands.join(', ')})`;

        // Extra penalty for Apple products (iPhone, iPad, etc.)
        if (expectedBrands.includes('Apple')) {
            result.riskScore += 15;
            result.flags['Apple Logo Missing'] = 'Apple logo not detected - critical authenticity marker';
        }
        return result;
    }

    // Check detected logos
    const detectedBrands = logos.map(l => l.description);
    const matchedBrand = detectedBrands.find(brand =>
        expectedBrands.some(expected =>
            brand.toLowerCase().includes(expected.toLowerCase()) ||
            expected.toLowerCase().includes(brand.toLowerCase())
        )
    );

    if (matchedBrand) {
        // Logo detected and matches expected brand
        const logoConfidence = logos.find(l => l.description === matchedBrand)?.score || 0;

        if (logoConfidence < 0.6) {
            result.riskScore += 40; // Increased from 30
            result.flags['Logo Quality'] = `Low confidence logo detection (${(logoConfidence * 100).toFixed(0)}%) - possible fake`;
        } else if (logoConfidence < 0.8) {
            result.riskScore += 20;
            result.flags['Logo Quality'] = `Moderate logo confidence (${(logoConfidence * 100).toFixed(0)}%)`;
        } else {
            // High confidence logo - good sign, but doesn't reduce risk
            result.flags['Brand Verified'] = `${matchedBrand} logo detected (${(logoConfidence * 100).toFixed(0)}% confidence)`;
        }
        result.detected = true;
    } else {
        // Wrong brand detected - MAJOR RED FLAG
        result.riskScore += 50; // Increased from 40
        result.flags['Brand Mismatch'] = `Unexpected brand: ${detectedBrands.join(', ')} (expected: ${expectedBrands.join(', ')})`;
    }

    // Check for multiple conflicting logos
    if (logos.length > 2) {
        result.riskScore += 35;
        result.flags['Multiple Logos'] = `${logos.length} different logos detected - highly suspicious`;
    }

    return result;
}

/**
 * Analyze text quality and detect misspellings
 */
function analyzeTextQuality(visionResult, category) {
    const result = {
        riskScore: 0,
        flags: {}
    };

    const textData = visionResult.textDetection || {};
    const detectedText = textData.text || '';
    const confidence = textData.confidence || 0;

    if (!detectedText) {
        // No text detected - not necessarily bad
        return result;
    }

    // Check for watermarks (STRONG counterfeit indicator)
    const watermarkPatterns = [
        'funskyonline',
        'stockphoto',
        'shutterstock',
        'gettyimages',
        'dreamstime',
        'istockphoto',
        'alamy',
        'depositphotos',
        'watermark',
        '.com/',
        'www.',
        'http://',
        'https://'
    ];

    const textLower = detectedText.toLowerCase();
    for (const watermark of watermarkPatterns) {
        if (textLower.includes(watermark)) {
            result.riskScore += 70;
            result.flags['Watermark Detected'] = `Stock photo or website watermark found: "${watermark}" - STRONG counterfeit indicator`;
            break;
        }
    }

    // Check OCR confidence (poor print quality indicator)
    if (confidence > 0 && confidence < 0.5) {
        result.riskScore += 30;
        result.flags['Text Quality'] = `Very poor text quality (${(confidence * 100).toFixed(0)}% confidence)`;
    } else if (confidence > 0 && confidence < 0.7) {
        result.riskScore += 15;
        result.flags['Text Quality'] = `Low text quality (${(confidence * 100).toFixed(0)}% confidence)`;
    }

    // Check for brand name misspellings
    for (const [correctBrand, misspellings] of Object.entries(commonMisspellings)) {
        for (const misspelling of misspellings) {
            if (textLower.includes(misspelling.toLowerCase())) {
                result.riskScore += 50;
                result.flags['Misspelled Brand'] = `Found "${misspelling}" (should be "${correctBrand}") - strong counterfeit indicator`;
                break;
            }
        }
    }

    // Check for common counterfeit text patterns
    const suspiciousPatterns = [
        'made in chaina', // Common misspelling
        'guarante', // Incomplete "guarantee"
        'orignal', // Misspelled "original"
        'authantic', // Misspelled "authentic"
        'waranty' // Misspelled "warranty"
    ];

    for (const pattern of suspiciousPatterns) {
        if (textLower.includes(pattern)) {
            result.riskScore += 35;
            result.flags['Suspicious Text'] = `Found suspicious text pattern: "${pattern}"`;
            break;
        }
    }

    return result;
}

/**
 * Check for known counterfeit patterns specific to categories
 */
function checkCounterfeitPatterns(visionResult, category) {
    const result = {
        riskScore: 0,
        flags: {}
    };

    const labels = visionResult.labels || [];
    const labelDescriptions = labels.map(l => l.description.toLowerCase());

    // Category-specific counterfeit patterns
    const patterns = {
        'Smartphones': {
            // Android branding on iPhones
            check: () => {
                const hasApple = labelDescriptions.some(l => l.includes('apple') || l.includes('iphone'));
                const hasAndroid = labelDescriptions.some(l => l.includes('android'));
                return hasApple && hasAndroid;
            },
            message: 'Apple branding with Android indicators - likely counterfeit'
        },
        'Shoes': {
            // Check for poor stitching indicators
            check: () => labelDescriptions.some(l => l.includes('defect') || l.includes('damage')),
            message: 'Quality defects detected in product'
        },
        'Watches': {
            // Plastic materials on luxury watches
            check: () => {
                const isLuxury = category === 'Watches';
                const hasPlastic = labelDescriptions.some(l => l.includes('plastic'));
                return isLuxury && hasPlastic;
            },
            message: 'Plastic materials detected on luxury watch'
        }
    };

    const categoryPattern = patterns[category];
    if (categoryPattern && categoryPattern.check()) {
        result.riskScore += 60;
        result.flags['Counterfeit Pattern'] = categoryPattern.message;
    }

    return result;
}

/**
 * Main authenticity analysis function
 */
function analyzeAuthenticity(visionResult, category, categoryValidation) {
    const logoResult = detectBrandLogo(visionResult, category);
    const textResult = analyzeTextQuality(visionResult, category);
    const patternResult = checkCounterfeitPatterns(visionResult, category);

    return {
        riskScore: logoResult.riskScore + textResult.riskScore + patternResult.riskScore,
        flags: {
            ...logoResult.flags,
            ...textResult.flags,
            ...patternResult.flags
        },
        details: {
            logoDetected: logoResult.detected,
            textQuality: visionResult.textDetection?.confidence || 0,
            patternsFound: Object.keys(patternResult.flags).length > 0
        }
    };
}

module.exports = {
    analyzeAuthenticity,
    detectBrandLogo,
    analyzeTextQuality,
    checkCounterfeitPatterns,
    brandMapping
};
