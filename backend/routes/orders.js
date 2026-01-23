const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, cancelOrder,   reorderFromOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All order routes require login

router.post('/', createOrder);
router.get('/', getUserOrders);
router.put('/:orderId/cancel', cancelOrder);
router.post('/:orderId/reorder', reorderFromOrder);
module.exports = router;