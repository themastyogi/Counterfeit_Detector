const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { register, login, updatePassword, forgotPassword, resetPassword, fixRole } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/update-password', updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/fix-role', protect, fixRole);

module.exports = router;
