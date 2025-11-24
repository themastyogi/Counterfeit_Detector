// Category validation service
// Maps product categories to expected Vision API labels

const categoryKeywords = {
    // Electronics
    'Smartphones': ['phone', 'smartphone', 'mobile', 'cellphone', 'iphone', 'android', 'device', 'screen', 'display'],
    'Tablets': ['tablet', 'ipad', 'device', 'screen', 'display', 'touchscreen'],
    'Laptops': ['laptop', 'computer', 'notebook', 'macbook', 'pc', 'keyboard', 'screen'],
    'Desktop Computers': ['computer', 'desktop', 'pc', 'monitor', 'keyboard', 'mouse'],
    'Smart Watches': ['watch', 'smartwatch', 'wearable', 'fitness', 'timepiece'],
    'Fitness Trackers': ['tracker', 'fitness', 'wearable', 'band', 'watch'],
    'Headphones': ['headphones', 'headset', 'audio', 'earphones', 'music'],
    'Earbuds': ['earbuds', 'earphones', 'audio', 'wireless', 'music'],
    'Speakers': ['speaker', 'audio', 'sound', 'music', 'bluetooth'],
    'Cameras': ['camera', 'lens', 'photography', 'photo', 'dslr'],
    'Drones': ['drone', 'quadcopter', 'aircraft', 'flying', 'aerial'],
    'Gaming Consoles': ['console', 'gaming', 'playstation', 'xbox', 'nintendo', 'controller'],
    'VR Headsets': ['vr', 'headset', 'virtual reality', 'goggles', 'gaming'],

    // Fashion & Accessories
    'Sunglasses': ['sunglasses', 'glasses', 'eyewear', 'shades', 'accessory'],
    'Eyeglasses': ['glasses', 'eyeglasses', 'eyewear', 'spectacles', 'frames'],
    'Eyewear': ['glasses', 'eyewear', 'sunglasses', 'eyeglasses'],
    'Handbags': ['handbag', 'bag', 'purse', 'tote', 'accessory', 'fashion'],
    'Wallets': ['wallet', 'purse', 'accessory', 'leather'],
    'Belts': ['belt', 'accessory', 'leather', 'fashion'],
    'Watches': ['watch', 'timepiece', 'wristwatch', 'accessory'],
    'Jewelry': ['jewelry', 'jewellery', 'necklace', 'ring', 'bracelet', 'earring'],
    'Shoes': ['shoe', 'footwear', 'sneaker', 'boot', 'sandal'],
    'Sneakers': ['sneaker', 'shoe', 'footwear', 'athletic', 'running'],
    'Boots': ['boot', 'shoe', 'footwear'],
    'Sandals': ['sandal', 'shoe', 'footwear', 'flip-flop'],
    'Clothing': ['clothing', 'apparel', 'shirt', 'pants', 'dress', 'jacket', 'textile', 'fabric', 'garment'],
    'Jackets': ['jacket', 'coat', 'outerwear', 'clothing'],
    'Hats': ['hat', 'cap', 'headwear', 'accessory'],
    'Scarves': ['scarf', 'accessory', 'textile'],

    // Beauty & Personal Care
    'Perfumes': ['perfume', 'fragrance', 'bottle', 'cosmetic', 'scent'],
    'Cosmetics': ['cosmetic', 'makeup', 'beauty', 'lipstick', 'powder'],

    // Sports & Outdoor
    'Sports Equipment': ['sports', 'equipment', 'ball', 'athletic', 'fitness'],
    'Fitness Equipment': ['fitness', 'equipment', 'gym', 'exercise', 'workout'],
    'Bicycles': ['bicycle', 'bike', 'cycling', 'wheel'],

    // Home & Kitchen
    'Kitchen Appliances': ['appliance', 'kitchen', 'cooking', 'blender', 'mixer'],
    'Furniture': ['furniture', 'chair', 'table', 'sofa', 'desk'],

    // Automotive
    'Car Parts': ['car', 'automotive', 'vehicle', 'part', 'auto'],
    'Tires': ['tire', 'tyre', 'wheel', 'automotive', 'rubber'],

    // Toys & Games
    'Toys': ['toy', 'plaything', 'game', 'doll', 'action figure'],
    'Board Games': ['game', 'board game', 'cards', 'dice'],

    // Health & Medical
    'Medicines': ['medicine', 'medication', 'pill', 'tablet', 'pharmaceutical', 'drug'],
    'Supplements': ['supplement', 'vitamin', 'pill', 'capsule', 'bottle'],

    // Food & Beverages
    'Packaged Foods': ['food', 'package', 'snack', 'product', 'packaging'],
    'Beverages': ['beverage', 'drink', 'bottle', 'can', 'liquid'],
    'Alcohol': ['alcohol', 'wine', 'beer', 'liquor', 'bottle', 'drink'],

    // Books & Media
    'Books': ['book', 'publication', 'text', 'reading', 'paper'],
    'DVDs': ['dvd', 'disc', 'media', 'movie'],
    'Video Games': ['video game', 'game', 'disc', 'cartridge'],

    // Office & Stationery
    'Office Supplies': ['office', 'stationery', 'supplies', 'paper', 'pen'],
    'Notebooks': ['notebook', 'notepad', 'paper', 'writing', 'stationery', 'book'],
    'Pens': ['pen', 'writing', 'stationery', 'ink'],

    // Audio
    'Audio': ['audio', 'sound', 'music', 'speaker', 'headphones', 'earbuds'],

    // Gaming
    'Gaming': ['gaming', 'game', 'console', 'controller', 'video game'],

    // Accessories
    'Accessories': ['accessory', 'fashion', 'jewelry', 'bag', 'belt'],

    // Other
    'Other': [] // Matches anything
};

/**
 * Validates if detected labels match the selected category
 * @param {string} selectedCategory - The category selected by user
 * @param {Array} detectedLabels - Labels from Vision API [{description: string, score: number}]
 * @returns {Object} - {isMatch: boolean, confidence: number, matchedLabels: [], reason: string}
 */
function validateCategory(selectedCategory, detectedLabels) {
    // If no category selected or "Other", always match
    if (!selectedCategory || selectedCategory === 'Other') {
        return {
            isMatch: true,
            confidence: 1.0,
            matchedLabels: detectedLabels.slice(0, 3).map(l => l.description),
            reason: 'No specific category validation required'
        };
    }

    const expectedKeywords = categoryKeywords[selectedCategory] || [];

    // If no keywords defined for category, be lenient
    if (expectedKeywords.length === 0) {
        return {
            isMatch: true,
            confidence: 0.5,
            matchedLabels: detectedLabels.slice(0, 3).map(l => l.description),
            reason: 'Category keywords not defined, allowing scan'
        };
    }

    // Check if any detected label matches expected keywords
    const matchedLabels = [];
    let totalConfidence = 0;
    let matchCount = 0;

    for (const label of detectedLabels) {
        const labelLower = label.description.toLowerCase();

        for (const keyword of expectedKeywords) {
            if (labelLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(labelLower)) {
                matchedLabels.push({
                    label: label.description,
                    keyword: keyword,
                    score: label.score
                });
                totalConfidence += label.score;
                matchCount++;
                break; // Don't count same label multiple times
            }
        }
    }

    const avgConfidence = matchCount > 0 ? totalConfidence / matchCount : 0;
    const isMatch = matchCount > 0 && avgConfidence > 0.5;

    return {
        isMatch,
        confidence: avgConfidence,
        matchedLabels: matchedLabels.map(m => m.label),
        matchedKeywords: matchedLabels.map(m => m.keyword),
        detectedLabels: detectedLabels.slice(0, 5).map(l => l.description),
        reason: isMatch
            ? `Detected ${matchCount} matching label(s) for ${selectedCategory}`
            : `No matching labels found for ${selectedCategory}. Detected: ${detectedLabels.slice(0, 3).map(l => l.description).join(', ')}`
    };
}

module.exports = { validateCategory, categoryKeywords };
