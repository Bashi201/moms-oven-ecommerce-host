// admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllCustomers,
  getCustomerById,
} = require('../controllers/adminController');

router.use(protect, admin); // Protect + admin-only middleware

// Dashboard
router.get('/dashboard', getDashboardStats);

// Order routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Customer routes
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);

module.exports = router;