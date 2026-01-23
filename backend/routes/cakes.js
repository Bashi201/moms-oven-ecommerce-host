const express = require('express');
const router = express.Router();
const {
  getAllCakes,
  getCakeById,
  createCake,
  updateCake,
  deleteCake
} = require('../controllers/cakeController');

const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllCakes);
router.get('/:id', getCakeById);

// Protected + Admin only routes
router.post('/', protect, admin, createCake);
router.put('/:id', protect, admin, updateCake);
router.delete('/:id', protect, admin, deleteCake);

module.exports = router;