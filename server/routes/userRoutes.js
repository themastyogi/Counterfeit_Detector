const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken, isSystemAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new user
router.post('/', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { fullName, email, password, role, status } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashed, role, status });
        await newUser.save();
        const userToReturn = newUser.toObject();
        delete userToReturn.password;
        res.status(201).json(userToReturn);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a user
router.put('/:id', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const { fullName, email, password, role, status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (role) user.role = role;
        if (status) user.status = status;
        if (req.body.tenant_id !== undefined) user.tenant_id = req.body.tenant_id || null;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        await user.save();
        const userToReturn = user.toObject();
        delete userToReturn.password;
        res.json(userToReturn);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a user
router.delete('/:id', verifyToken, isSystemAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
