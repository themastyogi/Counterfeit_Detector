const express = require('express');
const router = express.Router();
const { verifyToken, isSystemAdmin } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/testManagementController');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isSystemAdmin);

// ==================== TEST CATEGORIES ====================
router.get('/test-categories', getTestCategories);
router.post('/test-categories', createTestCategory);
router.put('/test-categories/:id', updateTestCategory);
router.delete('/test-categories/:id', deleteTestCategory);

// ==================== TEST PARAMETERS ====================
router.get('/test-parameters', getTestParameters);
router.get('/test-parameters/:categoryId', getTestParameters);
router.post('/test-parameters', createTestParameter);
router.put('/test-parameters/:id', updateTestParameter);
router.delete('/test-parameters/:id', deleteTestParameter);

// ==================== MASTER DATA ====================
router.get('/master-data', getAllMasterData);
router.get('/master-data/category/:categoryId', getMasterDataByCategory);
router.post('/master-data', createMasterData);
router.put('/master-data/:id', updateMasterData);
router.delete('/master-data/:id', deleteMasterData);

module.exports = router;
