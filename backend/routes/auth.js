const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // ← new import

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route - get current user
router.get('/me', protect, (req, res) => {
  res.json({
    message: 'User authenticated successfully',
    user: req.user
  });
});

module.exports = router;