const User = require('../models/User');
const Analysis = require('../models/Analysis');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User role updated',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Get system statistics (admin only)
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAnalyses = await Analysis.countDocuments();
        const recentAnalyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'fullName email');

        const stats = {
            totalUsers,
            totalAnalyses,
            recentAnalyses,
            systemStatus: 'operational'
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats
};
