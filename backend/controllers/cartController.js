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

// Helper to format cart items with images array
const formatCartItems = (items) => {
  return items.map(item => ({
    ...item,
    images: item.images ? item.images.split(',') : [],
    subtotal: parseFloat(item.price) * item.quantity  // per-item subtotal
  }));
};

// Add item to cart (or update quantity) + return updated cart
const addToCart = async (req, res) => {
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = user.id;
  const { cakeId, quantity = 1 } = req.body;

  const parsedCakeId = parseInt(cakeId);
  const parsedQuantity = parseInt(quantity);

  if (isNaN(parsedCakeId) || parsedQuantity < 1) {
    return res.status(400).json({ 
      message: 'Valid cakeId (number) and quantity (>=1) required' 
    });
  }

  try {
    // 1. Get current cake stock and price
    const [cakeRows] = await pool.query(
      'SELECT id, price, stock FROM cakes WHERE id = ?',
      [parsedCakeId]
    );

    if (cakeRows.length === 0) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    const cake = cakeRows[0];
    const availableStock = cake.stock;

    if (availableStock <= 0) {
      return res.status(400).json({ 
        message: 'This cake is currently out of stock' 
      });
    }

    // 2. Check existing quantity in cart
    const [existing] = await pool.query(
      'SELECT quantity FROM carts WHERE user_id = ? AND cake_id = ?',
      [userId, parsedCakeId]
    );

    const currentCartQty = existing.length > 0 ? existing[0].quantity : 0;
    const requestedTotalQty = currentCartQty + parsedQuantity;

    if (requestedTotalQty > availableStock) {
      return res.status(400).json({ 
        message: `Not enough stock available. Only ${availableStock} left (you already have ${currentCartQty} in cart)` 
      });
    }

    // 3. Safe to add/update
    if (existing.length > 0) {
      await pool.query(
        'UPDATE carts SET quantity = ? WHERE user_id = ? AND cake_id = ?',
        [requestedTotalQty, userId, parsedCakeId]
      );
    } else {
      await pool.query(
        'INSERT INTO carts (user_id, cake_id, quantity) VALUES (?, ?, ?)',
        [userId, parsedCakeId, parsedQuantity]
      );
    }

    // 4. Return updated cart (as improved earlier)
    const [updatedItems] = await pool.query(`
      SELECT 
        c.id AS cart_id,
        c.quantity,
        cake.id AS cake_id,
        cake.name,
        cake.price,
        cake.description,
        cake.stock,
        cake.category,
        GROUP_CONCAT(ci.image_url) AS images
      FROM carts c
      JOIN cakes cake ON c.cake_id = cake.id
      LEFT JOIN cake_images ci ON cake.id = ci.cake_id
      WHERE c.user_id = ?
      GROUP BY c.id, cake.id
      ORDER BY c.created_at DESC
    `, [userId]);

    const formattedItems = updatedItems.map(item => ({
      ...item,
      images: item.images ? item.images.split(',') : [],
      subtotal: parseFloat(item.price) * item.quantity
    }));

    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(201).json({
      message: 'Item added to cart successfully',
      cart: {
        items: formattedItems,
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Add to cart failed:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Server error while adding to cart',
      error: error.message 
    });
  }
};

// Get user's cart (with total)
const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const [items] = await pool.query(`
      SELECT 
        c.id AS cart_id,
        c.quantity,
        cake.id AS cake_id,
        cake.name,
        cake.price,
        cake.description,
        cake.stock,
        cake.category,
        GROUP_CONCAT(ci.image_url) AS images
      FROM carts c
      JOIN cakes cake ON c.cake_id = cake.id
      LEFT JOIN cake_images ci ON cake.id = ci.cake_id
      WHERE c.user_id = ?
      GROUP BY c.id, cake.id
      ORDER BY c.created_at DESC
    `, [userId]);

    const formattedItems = formatCartItems(items);
    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items: formattedItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update cart item quantity + return updated cart
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { cartId } = req.params;
  const { quantity } = req.body;

  const parsedQuantity = parseInt(quantity);

  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE carts SET quantity = ? WHERE id = ? AND user_id = ?',
      [parsedQuantity, cartId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found or not yours' });
    }

    // Return updated cart
    const [updatedItems] = await pool.query(/* same query as getCart */ `
      SELECT 
        c.id AS cart_id,
        c.quantity,
        cake.id AS cake_id,
        cake.name,
        cake.price,
        cake.description,
        cake.stock,
        cake.category,
        GROUP_CONCAT(ci.image_url) AS images
      FROM carts c
      JOIN cakes cake ON c.cake_id = cake.id
      LEFT JOIN cake_images ci ON cake.id = ci.cake_id
      WHERE c.user_id = ?
      GROUP BY c.id, cake.id
    `, [userId]);

    const formattedItems = formatCartItems(updatedItems);
    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      message: 'Cart item updated',
      cart: {
        items: formattedItems,
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove & Clear can stay simple (or also return updated cart if you want)

const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { cartId } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM carts WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found or not yours' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM carts WHERE user_id = ?', [userId]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};