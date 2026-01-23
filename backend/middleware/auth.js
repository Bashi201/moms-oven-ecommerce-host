const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request (without password)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next(); // Continue to the route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized - invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized - no token provided' });
  }
};

// Optional: Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized - admin access required' });
  }
};

module.exports = { protect, admin };