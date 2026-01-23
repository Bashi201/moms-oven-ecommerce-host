const fs = require('fs/promises'); // Use promises version to avoid blocking
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
require('dotenv').config();
const { uploadMultiple } = require('../middleware/upload');

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

// Helper: create safe folder name
function createCakeFolderName(name, cakeId) {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // remove special chars
    .replace(/\s+/g, '-')             // spaces → hyphen
    .replace(/-+/g, '-');             // multiple hyphens → one

  if (!slug) slug = 'cake';

  return `${slug}-${cakeId}`;
}

const getAllCakes = async (req, res) => {
  try {
    const [cakes] = await pool.query(`
      SELECT 
        c.id, c.name, c.description, c.price, c.stock, c.category, c.created_at,
        GROUP_CONCAT(ci.image_url) AS images
      FROM cakes c
      LEFT JOIN cake_images ci ON c.id = ci.cake_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    // Format the images as array (GROUP_CONCAT returns comma-separated string)
    const formattedCakes = cakes.map(cake => ({
      ...cake,
      images: cake.images ? cake.images.split(',') : []
    }));

    res.json(formattedCakes);
  } catch (error) {
    console.error('Error fetching cakes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCakeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [cakes] = await pool.query(`
      SELECT 
        c.*,
        GROUP_CONCAT(ci.image_url) AS images
      FROM cakes c
      LEFT JOIN cake_images ci ON c.id = ci.cake_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (cakes.length === 0) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    const cake = cakes[0];
    const formattedCake = {
      ...cake,
      images: cake.images ? cake.images.split(',') : []
    };

    res.json(formattedCake);
  } catch (error) {
    console.error('Error fetching cake by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCake = async (req, res) => {
  try {
    // Wait for multer to process files
    await new Promise((resolve, reject) => {
      uploadMultiple(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const { name, description, price, stock = 0, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // 1. Create cake record
    const [cakeResult] = await pool.query(
      'INSERT INTO cakes (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, parseFloat(price), parseInt(stock), category || null]
    );

    const cakeId = cakeResult.insertId;

    // 2. Create dedicated folder
    const folderName = createCakeFolderName(name, cakeId);
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', folderName);

    await fs.mkdir(folderPath, { recursive: true });

    // 3. Move images from temp to final folder + save to DB
    let uploadedCount = 0;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const newFileName = file.filename;
        const newPath = path.join(folderPath, newFileName);

        // Async move
        await fs.rename(file.path, newPath);

        const imageUrl = `/uploads/${folderName}/${newFileName}`;

        await pool.query(
          'INSERT INTO cake_images (cake_id, image_url) VALUES (?, ?)',
          [cakeId, imageUrl]
        );

        uploadedCount++;
      }
    }

    // Success response
    res.status(201).json({
      message: 'Cake created successfully',
      cakeId,
      folder: folderName,
      uploadedImages: uploadedCount
    });

  } catch (error) {
    console.error('Create cake error:', error);

    // Clean up temp files if any exist
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          if (await fs.stat(file.path).catch(() => false)) {
            await fs.unlink(file.path);
          }
        } catch (cleanupErr) {
          console.error('Cleanup failed:', cleanupErr);
        }
      }
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${error.message}` });
    }

    res.status(500).json({
      message: 'Server error while creating cake',
      details: error.message
    });
  }
};

const updateCake = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, stock, category } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE cakes SET name = ?, description = ?, price = ?, image_url = ?, stock = ?, category = ? WHERE id = ?',
      [name || null, description || null, price || null, image_url || null, stock || null, category || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    res.json({ message: 'Cake updated successfully' });
  } catch (error) {
    console.error('Error updating cake:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCake = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM cakes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    res.json({ message: 'Cake deleted successfully' });
  } catch (error) {
    console.error('Error deleting cake:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCakes,
  getCakeById,
  createCake,
  updateCake,
  deleteCake
};