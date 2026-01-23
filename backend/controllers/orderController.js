const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Create order from current cart (Checkout)
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;  // ← now expect address in body

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    return res.status(400).json({ 
      message: 'Delivery address is required and must be at least 5 characters' 
    });
  }

  const connection = await pool.getConnection(); // Use transaction

  try {
    await connection.beginTransaction();

    // 1. Get cart items with latest price & stock
    const [cartItems] = await connection.query(`
      SELECT 
        c.id AS cart_id,
        c.quantity,
        cake.id AS cake_id,
        cake.name,
        cake.price,
        cake.stock
      FROM carts c
      JOIN cakes cake ON c.cake_id = cake.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Validate stock & calculate total
    let totalAmount = 0;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Only ${item.stock} available.`);
      }
      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // 3. Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status, payment_method, address) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount.toFixed(2), 'pending', 'COD', address.trim()]
    );

    const orderId = orderResult.insertId;

    // 4. Create order items & reduce stock
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, cake_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.cake_id, item.quantity, parseFloat(item.price)]
      );

      // Reduce stock
      await connection.query(
        'UPDATE cakes SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.cake_id]
      );
    }

    // 5. Clear cart
    await connection.query('DELETE FROM carts WHERE user_id = ?', [userId]);

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId: orderResult.insertId,
      totalAmount: totalAmount.toFixed(2),
      status: 'pending',
      paymentMethod: 'COD',
      address: address.trim(),
      itemCount: cartItems.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order failed:', error.message, error.stack);

    if (error.message.includes('Not enough stock')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: 'Server error while creating order',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Get user's orders with summary
const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await pool.query(`
      SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.address,
        o.created_at,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order details with items (NEW)
const getOrderDetails = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  try {
    // Get order with basic info
    const [orders] = await pool.query(`
      SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.payment_method, 
        o.address,
        o.created_at
      FROM orders o
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or not yours' });
    }

    const order = orders[0];

    // Get order items with cake details and images
    const [items] = await pool.query(`
      SELECT 
        oi.id,
        oi.cake_id,
        oi.quantity,
        oi.price_at_purchase,
        c.name,
        c.description,
        c.category,
        GROUP_CONCAT(ci.image_url) AS images
      FROM order_items oi
      JOIN cakes c ON oi.cake_id = c.id
      LEFT JOIN cake_images ci ON c.id = ci.cake_id
      WHERE oi.order_id = ?
      GROUP BY oi.id, c.id
    `, [orderId]);

    // Format items with images array
    const formattedItems = items.map(item => ({
      ...item,
      images: item.images ? item.images.split(',') : [],
      subtotal: parseFloat(item.price_at_purchase) * item.quantity
    }));

    res.json({
      order: {
        ...order,
        items: formattedItems,
        item_count: formattedItems.length
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel order (only if pending or confirmed)
const cancelOrder = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if order exists and belongs to user
    const [orders] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or not yours' });
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Get order items to restore stock
    const [items] = await connection.query(
      'SELECT cake_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    // Restore stock for each item
    for (const item of items) {
      await connection.query(
        'UPDATE cakes SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.cake_id]
      );
    }

    // Update order status to cancelled
    await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', orderId]
    );

    await connection.commit();

    res.json({ 
      message: 'Order cancelled successfully',
      orderId: orderId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      message: 'Server error while cancelling order',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

// Reorder - Create new cart items from past order (NEW)
const reorderFromOrder = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify order belongs to user
    const [orders] = await connection.query(
      'SELECT id FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or not yours' });
    }

    // Get order items
    const [items] = await connection.query(`
      SELECT 
        oi.cake_id,
        oi.quantity,
        c.stock,
        c.name
      FROM order_items oi
      JOIN cakes c ON oi.cake_id = c.id
      WHERE oi.order_id = ?
    `, [orderId]);

    if (items.length === 0) {
      return res.status(400).json({ message: 'No items found in this order' });
    }

    // Check stock availability and add to cart
    const unavailableItems = [];
    const addedItems = [];

    for (const item of items) {
      if (item.stock < item.quantity) {
        unavailableItems.push({
          name: item.name,
          requested: item.quantity,
          available: item.stock
        });
        continue;
      }

      // Check if item already in cart
      const [existing] = await connection.query(
        'SELECT quantity FROM carts WHERE user_id = ? AND cake_id = ?',
        [userId, item.cake_id]
      );

      if (existing.length > 0) {
        // Update quantity
        await connection.query(
          'UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND cake_id = ?',
          [item.quantity, userId, item.cake_id]
        );
      } else {
        // Insert new cart item
        await connection.query(
          'INSERT INTO carts (user_id, cake_id, quantity) VALUES (?, ?, ?)',
          [userId, item.cake_id, item.quantity]
        );
      }

      addedItems.push(item.name);
    }

    await connection.commit();

    res.json({
      message: 'Items added to cart',
      addedItems: addedItems.length,
      unavailableItems,
      success: addedItems.length > 0
    });
  } catch (error) {
    await connection.rollback();
    console.error('Reorder error:', error);
    res.status(500).json({ 
      message: 'Server error while reordering',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  reorderFromOrder
};