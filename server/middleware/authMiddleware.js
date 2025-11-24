const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    console.log('🛡️ verifyToken middleware hit for:', req.originalUrl);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('❌ No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.id);
        req.user = decoded; // { id, role, tenant_id }
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to check if user is system admin
const isSystemAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'system_admin') {
        next();
    } else {
        console.log('❌ Access denied. User role:', req.user ? req.user.role : 'none');
        return res.status(403).json({ message: 'Access denied. System Admin only.' });
    }
};

// Middleware to check if user is tenant admin (or system admin)
const isTenantAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'tenant_admin' || req.user.role === 'system_admin')) {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Tenant Admin only.' });
    }
};

// Middleware to check if user is manager (or higher)
const isManager = (req, res, next) => {
    const allowedRoles = ['manager', 'tenant_admin', 'system_admin'];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Manager access required.' });
    }
};

module.exports = { verifyToken, isSystemAdmin, isTenantAdmin, isManager };
