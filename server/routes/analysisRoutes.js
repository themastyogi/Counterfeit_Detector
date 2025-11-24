const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { performAnalysis, getAnalysisHistory, getAnalysisById, getUserStats } = require('../controllers/analysisController');

// Public routes
router.get('/history', getAnalysisHistory);
router.get('/analysis/:id', getAnalysisById);

// Analysis route (temporarily without auth)
router.post('/analyze', upload.single('image'), performAnalysis);

// User stats route (public for now)
router.get('/stats', getUserStats);

module.exports = router;
