const TestCategory = require('../models/TestCategory');
const TestParameter = require('../models/TestParameter');
const MasterData = require('../models/MasterData');

// ==================== TEST CATEGORIES ====================

// Get all test categories
const getTestCategories = async (req, res) => {
    try {
        const categories = await TestCategory.find({ isActive: true })
            .populate('createdBy', 'fullName email')
            .sort({ name: 1 });

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test categories',
            error: error.message
        });
    }
};

// Create test category
const createTestCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        const createdBy = req.user.id;

        const category = new TestCategory({
            name,
            description,
            icon: icon || 'FileText',
            createdBy
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Test category created successfully',
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating test category',
            error: error.message
        });
    }
};

// Update test category
const updateTestCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, isActive } = req.body;

        const category = await TestCategory.findByIdAndUpdate(
            id,
            { name, description, icon, isActive },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Test category not found'
            });
        }

        res.json({
            success: true,
            message: 'Test category updated successfully',
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating test category',
            error: error.message
        });
    }
};

// Delete test category
const deleteTestCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - just mark as inactive
        const category = await TestCategory.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Test category not found'
            });
        }

        res.json({
            success: true,
            message: 'Test category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting test category',
            error: error.message
        });
    }
};

// ==================== TEST PARAMETERS ====================

// Get parameters (all or by category)
const getTestParameters = async (req, res) => {
    console.log('🔍 GET /test-parameters hit');
    console.log('Params:', req.params);
    console.log('Query:', req.query);

    try {
        const { categoryId } = req.params;
        const query = categoryId ? { categoryId } : {};

        console.log('Searching with query:', query);

        const parameters = await TestParameter.find(query)
            .populate('categoryId', 'name')
            .sort({ name: 1 });

        console.log(`✅ Found ${parameters.length} parameters`);

        res.json({
            success: true,
            parameters
        });
    } catch (error) {
        console.error('❌ ERROR in getTestParameters:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test parameters',
            error: error.message
        });
    }
};

// Create test parameter
const createTestParameter = async (req, res) => {
    try {
        const { categoryId, name, description, parameterType, expectedValue, isRequired } = req.body;

        const parameter = new TestParameter({
            categoryId,
            name,
            description,
            parameterType,
            expectedValue,
            isRequired
        });

        await parameter.save();

        res.status(201).json({
            success: true,
            message: 'Test parameter created successfully',
            parameter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating test parameter',
            error: error.message
        });
    }
};

// Update test parameter
const updateTestParameter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, parameterType, expectedValue, isRequired } = req.body;

        const parameter = await TestParameter.findByIdAndUpdate(
            id,
            { name, description, parameterType, expectedValue, isRequired },
            { new: true, runValidators: true }
        );

        if (!parameter) {
            return res.status(404).json({
                success: false,
                message: 'Test parameter not found'
            });
        }

        res.json({
            success: true,
            message: 'Test parameter updated successfully',
            parameter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating test parameter',
            error: error.message
        });
    }
};

// Delete test parameter
const deleteTestParameter = async (req, res) => {
    try {
        const { id } = req.params;

        const parameter = await TestParameter.findByIdAndDelete(id);

        if (!parameter) {
            return res.status(404).json({
                success: false,
                message: 'Test parameter not found'
            });
        }

        res.json({
            success: true,
            message: 'Test parameter deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting test parameter',
            error: error.message
        });
    }
};

// ==================== MASTER DATA ====================

// Get all master data
const getAllMasterData = async (req, res) => {
    try {
        const masterData = await MasterData.find({ isActive: true })
            .populate('categoryId', 'name')
            .populate('parameters.parameterId', 'name')
            .populate('createdBy', 'fullName email')
            .sort({ itemName: 1 });

        res.json({
            success: true,
            masterData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching master data',
            error: error.message
        });
    }
};

// Get master data by category
const getMasterDataByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const masterData = await MasterData.find({ categoryId, isActive: true })
            .populate('parameters.parameterId', 'name')
            .sort({ itemName: 1 });

        res.json({
            success: true,
            masterData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching master data',
            error: error.message
        });
    }
};

// Create master data
const createMasterData = async (req, res) => {
    try {
        const { categoryId, itemName, parameters, referenceImages } = req.body;
        const createdBy = req.user.id;

        const masterData = new MasterData({
            categoryId,
            itemName,
            parameters,
            referenceImages: referenceImages || [],
            createdBy
        });

        await masterData.save();

        res.status(201).json({
            success: true,
            message: 'Master data created successfully',
            masterData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating master data',
            error: error.message
        });
    }
};

// Update master data
const updateMasterData = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName, parameters, referenceImages, isActive } = req.body;

        const masterData = await MasterData.findByIdAndUpdate(
            id,
            { itemName, parameters, referenceImages, isActive },
            { new: true, runValidators: true }
        );

        if (!masterData) {
            return res.status(404).json({
                success: false,
                message: 'Master data not found'
            });
        }

        res.json({
            success: true,
            message: 'Master data updated successfully',
            masterData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating master data',
            error: error.message
        });
    }
};

// Delete master data
const deleteMasterData = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete
        const masterData = await MasterData.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!masterData) {
            return res.status(404).json({
                success: false,
                message: 'Master data not found'
            });
        }

        res.json({
            success: true,
            message: 'Master data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting master data',
            error: error.message
        });
    }
};

module.exports = {
    // Categories
    getTestCategories,
    createTestCategory,
    updateTestCategory,
    deleteTestCategory,
    // Parameters
    getTestParameters,
    createTestParameter,
    updateTestParameter,
    deleteTestParameter,
    // Master Data
    getAllMasterData,
    getMasterDataByCategory,
    createMasterData,
    updateMasterData,
    deleteMasterData
};
