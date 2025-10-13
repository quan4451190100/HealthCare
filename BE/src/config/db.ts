import { createPool, createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "281810";
const DB_NAME = process.env.DB_NAME || "health_ai";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initializeDatabase(): Promise<void> {
  // Ensure database exists
  const conn = await createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS, port: DB_PORT });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conn.end();

  // Ensure users table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Add phone column if it doesn't exist
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding phone column:', err.message);
    }
  }

  // Add address column if it doesn't exist
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN address VARCHAR(500) DEFAULT NULL;`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding address column:', err.message);
    }
  }

  // Add OAuth fields
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL UNIQUE;`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding google_id column:', err.message);
    }
  }

  try {
    await pool.query(`ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) DEFAULT NULL UNIQUE;`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding facebook_id column:', err.message);
    }
  }

  try {
    await pool.query(`ALTER TABLE users ADD COLUMN provider ENUM('local','google','facebook') DEFAULT 'local';`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding provider column:', err.message);
    }
  }

  try {
    await pool.query(`ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL;`);
  } catch (err: any) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding profile_picture column:', err.message);
    }
  }

  // Allow password to be NULL for OAuth users
  try {
    await pool.query(`ALTER TABLE users MODIFY password VARCHAR(255) DEFAULT NULL;`);
  } catch (err: any) {
    console.error('Error modifying password column:', err.message);
  }

  // Ensure posts table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      post_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      type ENUM('question','article') DEFAULT 'question',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure likes table exists (đổi tên từ post_likes)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      like_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      post_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (like_id),
      UNIQUE KEY unique_post_user_like (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure comments table exists (đổi tên từ post_comments)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      comment_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      post_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (comment_id),
      FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure notifications table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      noti_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      content VARCHAR(500) NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (noti_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ensure reports table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      report_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      post_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      reason VARCHAR(500),
      status ENUM('pending','reviewed','resolved') DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id),
      FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export default pool;
