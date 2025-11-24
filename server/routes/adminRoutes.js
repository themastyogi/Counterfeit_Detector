const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isSystemAdmin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats
} = require('../controllers/adminController');

// Configure multer for credentials file upload
const credentialsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..'));
    },
    filename: (req, file, cb) => {
        cb(null, 'google-credentials.json');
    }
});

const uploadCredentials = multer({
    storage: credentialsStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'));
        }
    }
});

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isSystemAdmin);

router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:userId', deleteUser);
router.get('/stats', getSystemStats);

// Upload Google Cloud credentials
router.post('/upload-credentials', uploadCredentials.single('credentials'), async (req, res) => {
    try {
        // Update .env file
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Update or add GOOGLE_APPLICATION_CREDENTIALS
        const credPath = './google-credentials.json';
        if (envContent.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            envContent = envContent.replace(
                /GOOGLE_APPLICATION_CREDENTIALS=.*/,
                `GOOGLE_APPLICATION_CREDENTIALS=${credPath}`
            );
        } else {
            envContent += `\nGOOGLE_APPLICATION_CREDENTIALS=${credPath}\n`;
        }

        fs.writeFileSync(envPath, envContent);

        res.json({
            success: true,
            message: 'Credentials uploaded successfully. Please restart the server to apply changes.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error uploading credentials', error: error.message });
    }
});

module.exports = router;
