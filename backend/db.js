const mysql = require('mysql2');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'moms_oven_db';

// First connection - without database selected (to create DB if needed)
const initialConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true
});

const initializeDatabase = (callback) => {
  initialConnection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return callback(err);
    }

    console.log('Connected to MySQL server (initial connection)');

    // Create database if it doesn't exist
    initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
      if (err) {
        console.error('Error creating database:', err);
        return callback(err);
      }
      console.log(`Database "${dbName}" created or already exists.`);

      // Now create a new connection with the specific database
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: dbName,
        multipleStatements: true
      });

      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          return callback(err);
        }

        console.log(`Successfully connected to database "${dbName}"`);

        // Create all tables
        const createTablesQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'customer') DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS cakes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image_url VARCHAR(255),
            stock INT DEFAULT 0,
            category VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
            payment_method ENUM('COD') DEFAULT 'COD',
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            cake_id INT NOT NULL,
            quantity INT NOT NULL,
            price_at_purchase DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS cake_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cake_id INT NOT NULL,
          image_url VARCHAR(255) NOT NULL,
          is_primary TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE,
          INDEX idx_cake_id (cake_id),
         INDEX idx_is_primary (is_primary)
          );

          CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('unread', 'read') DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
         );

          CREATE TABLE IF NOT EXISTS carts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            cake_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
          );
        `;

        connection.query(createTablesQuery, (err) => {
          if (err) {
            console.error('Error creating tables:', err);
            return callback(err);
          }
          console.log('All tables created or already exist.');
          callback(null, connection);
        });
      });
    });
  });
};

module.exports = { initializeDatabase };