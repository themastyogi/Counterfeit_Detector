// Detection Profiles Configuration
// Brand and category-specific detection parameters

module.exports = {
    // Baseline risk scores by category
    categoryBaselines: {
        'Smartphones': 25,      // Higher baseline - high counterfeit risk
        'Tablets': 25,
        'Laptops': 20,
        'Watches': 30,          // Very high counterfeit risk
        'Smart Watches': 25,
        'Shoes': 25,
        'Sneakers': 30,         // Very high counterfeit risk
        'Handbags': 35,         // Extremely high counterfeit risk
        'Sunglasses': 25,
        'Eyeglasses': 20,
        'Eyewear': 20,
        'Headphones': 20,
        'Earbuds': 20,
        'Perfumes': 30,         // High counterfeit risk
        'Cosmetics': 25,
        'Clothing': 20,
        'Jackets': 20,
        'Books': 10,            // Lower counterfeit risk
        'Other': 15
    },

    // Brand-specific logo confidence thresholds
    brandLogoThresholds: {
        'Apple': {
            minConfidence: 0.7,     // Apple logo can be hard to detect on black devices
            lowConfidencePenalty: 30,
            missingPenalty: 40
        },
        'Nike': {
            minConfidence: 0.75,
            lowConfidencePenalty: 35,
            missingPenalty: 35
        },
        'Adidas': {
            minConfidence: 0.75,
            lowConfidencePenalty: 35,
            missingPenalty: 35
        },
        'Gucci': {
            minConfidence: 0.8,
            lowConfidencePenalty: 40,
            missingPenalty: 45
        },
        'Louis Vuitton': {
            minConfidence: 0.8,
            lowConfidencePenalty: 40,
            missingPenalty: 45
        },
        'Rolex': {
            minConfidence: 0.85,
            lowConfidencePenalty: 45,
            missingPenalty: 50
        },
        'Samsung': {
            minConfidence: 0.75,
            lowConfidencePenalty: 30,
            missingPenalty: 35
        },
        'default': {
            minConfidence: 0.75,
            lowConfidencePenalty: 35,
            missingPenalty: 35
        }
    },

    // Known detection challenges and adjustments
    detectionChallenges: {
        'Apple': {
            // Apple logo on black/dark devices is harder to detect
            darkDeviceAdjustment: -10,  // Reduce penalty if dark colors detected
            notes: 'Logo detection may be challenging on dark devices'
        },
        'Books': {
            // Books may not have prominent logos
            noLogoAdjustment: -20,      // Reduce penalty if no logo detected
            notes: 'Books may not have brand logos on cover'
        }
    },

    // Text quality thresholds by category
    textQualityThresholds: {
        'Books': {
            minConfidence: 0.6,         // Books should have readable text
            lowConfidencePenalty: 25
        },
        'Perfumes': {
            minConfidence: 0.7,
            lowConfidencePenalty: 30
        },
        'default': {
            minConfidence: 0.65,
            lowConfidencePenalty: 20
        }
    },

    // Get baseline risk for category
    getBaselineRisk(category) {
        return this.categoryBaselines[category] || this.categoryBaselines['Other'];
    },

    // Get logo threshold for brand
    getLogoThreshold(brand) {
        return this.brandLogoThresholds[brand] || this.brandLogoThresholds['default'];
    },

    // Get detection challenge adjustments
    getChallengeAdjustment(brand, context) {
        const challenge = this.detectionChallenges[brand];
        if (!challenge) return 0;

        let adjustment = 0;

        // Check for dark device (Apple)
        if (brand === 'Apple' && context.hasDarkColors) {
            adjustment += challenge.darkDeviceAdjustment;
        }

        // Check for books without logos
        if (brand === 'Books' && context.noLogo) {
            adjustment += challenge.noLogoAdjustment;
        }

        return adjustment;
    },

    // Get text quality threshold
    getTextThreshold(category) {
        return this.textQualityThresholds[category] || this.textQualityThresholds['default'];
    }
};
