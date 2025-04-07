const jwt = require('jsonwebtoken');

// Middleware for authentication
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    //console.log("Authorization Header:", token);  // Log the token

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Unauthorized!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Decode Error:");
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

module.exports = authMiddleware;
