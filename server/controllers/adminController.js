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
        // Calculate date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total scans
        const totalScans = await Analysis.countDocuments();

        // Current month scans
        const currentMonthScans = await Analysis.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Last month scans
        const lastMonthScans = await Analysis.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        // Calculate scan trend
        const scanTrend = lastMonthScans > 0
            ? Math.round(((currentMonthScans - lastMonthScans) / lastMonthScans) * 100)
            : 0;

        // Counterfeits (suspicious/counterfeit detections)
        const totalCounterfeits = await Analysis.countDocuments({
            'analysis.status': { $in: ['suspicious', 'counterfeit', 'fake'] }
        });

        const currentMonthCounterfeits = await Analysis.countDocuments({
            'analysis.status': { $in: ['suspicious', 'counterfeit', 'fake'] },
            createdAt: { $gte: startOfMonth }
        });

        const lastMonthCounterfeits = await Analysis.countDocuments({
            'analysis.status': { $in: ['suspicious', 'counterfeit', 'fake'] },
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        const counterfeitTrend = lastMonthCounterfeits > 0
            ? Math.round(((currentMonthCounterfeits - lastMonthCounterfeits) / lastMonthCounterfeits) * 100)
            : 0;

        // Active users (users who have performed scans this month)
        const activeUserIds = await Analysis.distinct('userId', {
            createdAt: { $gte: startOfMonth }
        });
        const activeUsers = activeUserIds.length;

        const lastMonthActiveUserIds = await Analysis.distinct('userId', {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const lastMonthActiveUsers = lastMonthActiveUserIds.length;

        const activeUserTrend = lastMonthActiveUsers > 0
            ? Math.round(((activeUsers - lastMonthActiveUsers) / lastMonthActiveUsers) * 100)
            : 0;

        // Total users
        const totalUsers = await User.countDocuments();

        // System health check
        const recentScans = await Analysis.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });
        const systemStatus = recentScans > 0 ? 'Healthy' : 'Idle';

        // Recent analyses for activity feed
        const recentAnalyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'fullName email');

        const stats = {
            totalScans,
            scanTrend: scanTrend > 0 ? `+${scanTrend}%` : `${scanTrend}%`,
            totalCounterfeits,
            counterfeitTrend: counterfeitTrend > 0 ? `+${counterfeitTrend}%` : `${counterfeitTrend}%`,
            activeUsers,
            activeUserTrend: activeUserTrend > 0 ? `+${activeUserTrend}%` : `${activeUserTrend}%`,
            totalUsers,
            systemStatus,
            recentAnalyses
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
