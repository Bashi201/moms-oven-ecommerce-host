const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:cartId', updateCartItem);
router.delete('/:cartId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;