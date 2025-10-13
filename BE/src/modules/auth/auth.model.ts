import pool from "../../config/db";

export type UserRecord = {
  user_id: number;
  name: string;
  email: string;
  password: string | null;
  phone?: string;
  address?: string;
  google_id?: string;
  facebook_id?: string;
  provider: "local" | "google" | "facebook";
  profile_picture?: string;
  role: "user" | "admin";
  created_at: string;
};

export const findUserByEmail = async (email: string) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  const arr = rows as UserRecord[];
  return arr[0] || null;
};

export const createUser = async (name: string, email: string, passwordHash: string) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  // @ts-ignore mysql2 RowDataPacket/ResultSetHeader types
  const insertId = result.insertId as number;
  return insertId;
};

export const findUserById = async (userId: number) => {
  const [rows] = await pool.query(
    "SELECT user_id, name, email, phone, address, role, created_at FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );
  const arr = rows as Omit<UserRecord, 'password'>[];
  return arr[0] || null;
};

export const updateUser = async (userId: number, name: string, email: string, phone?: string, address?: string) => {
  const [result] = await pool.query(
    "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE user_id = ?",
    [name, email, phone || null, address || null, userId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

// Tìm user theo Google ID
export const findUserByGoogleId = async (googleId: string) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE google_id = ? LIMIT 1", [googleId]);
  const arr = rows as UserRecord[];
  return arr[0] || null;
};

// Tìm user theo Facebook ID
export const findUserByFacebookId = async (facebookId: string) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE facebook_id = ? LIMIT 1", [facebookId]);
  const arr = rows as UserRecord[];
  return arr[0] || null;
};

// Tạo user với OAuth
export const createOAuthUser = async (
  name: string,
  email: string,
  provider: 'google' | 'facebook',
  providerId: string,
  profilePicture?: string
) => {
  const googleId = provider === 'google' ? providerId : null;
  const facebookId = provider === 'facebook' ? providerId : null;

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, provider, google_id, facebook_id, profile_picture) 
     VALUES (?, ?, NULL, ?, ?, ?, ?)`,
    [name, email, provider, googleId, facebookId, profilePicture || null]
  );
  // @ts-ignore
  const insertId = result.insertId as number;
  return insertId;
};
