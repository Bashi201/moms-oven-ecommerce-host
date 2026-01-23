const mysql = require('mysql2');
//require('dotenv').config();

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

const getDashboardStats = async (req, res) => {
  try {
    // Total Orders
    const [ordersCount] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const totalOrders = ordersCount[0].total;

    // Total Revenue (sum of total_amount from completed orders)
    const [revenue] = await pool.query(
      'SELECT SUM(total_amount) as total FROM orders WHERE status = ?',
      ['completed']
    );
    const totalRevenue = revenue[0].total || 0;

    // Total Customers (users with role 'customer')
    const [customersCount] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = ?',
      ['customer']
    );
    const totalCustomers = customersCount[0].total;

    // Total Products (cakes)
    const [productsCount] = await pool.query('SELECT COUNT(*) as total FROM cakes');
    const totalProducts = productsCount[0].total;

    // Pending Orders
    const [pendingCount] = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE status = ?',
      ['pending']
    );
    const pendingOrders = pendingCount[0].total;

    // Completed Orders
    const [completedCount] = await pool.query(
      'SELECT COUNT(*) as total FROM orders WHERE status = ?',
      ['completed']
    );
    const completedOrders = completedCount[0].total;

    // Recent Orders (last 5, with basic details)
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id, o.total_amount as total, o.status, o.created_at,
        u.username as customerName,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as itemCount
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders,
      completedOrders,
      recentOrders: recentOrders.map(order => ({
        ...order,
        items: order.itemCount
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

// Get all orders with customer info
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_method,
        o.address,
        o.created_at,
        u.username as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order with items
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get order details
    const [orders] = await pool.query(
      `
      SELECT 
        o.*,
        u.username as customer_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const [items] = await pool.query(
      `
      SELECT 
        oi.id,
        oi.cake_id,
        oi.quantity,
        oi.price_at_purchase,
        c.name as cake_name
      FROM order_items oi
      LEFT JOIN cakes c ON oi.cake_id = c.id
      WHERE oi.order_id = ?
    `,
      [id]
    );

    const order = {
      ...orders[0],
      items,
    };

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', status });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all customers with their stats
const getAllCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_spent,
        MAX(o.created_at) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ customers });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single customer with order history
const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get customer details
    const [customers] = await pool.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `,
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get customer's order history
    const [orders] = await pool.query(
      `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [id]
    );

    const customer = {
      ...customers[0],
      orders,
    };

    res.json(customer);
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllCustomers,
  getCustomerById,
};