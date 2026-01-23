const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  submitContactForm,
  getAllMessages,
  markMessageAsRead,
  deleteMessage,
} = require('../controllers/contactController');

// Public route - anyone can submit contact form
router.post('/', submitContactForm);

// Admin routes - require authentication
router.get('/', protect, admin, getAllMessages);
router.put('/:id/read', protect, admin, markMessageAsRead);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;