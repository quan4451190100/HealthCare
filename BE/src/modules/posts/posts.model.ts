import pool from "../../config/db";

export interface PostRecord {
  post_id: number;
  user_id: number;
  title: string;
  content: string;
  type: 'question' | 'article';
  created_at: Date;
  updated_at: Date;
}

export interface LikeRecord {
  like_id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
}

export interface CommentRecord {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  author_name?: string;
}

export const createPost = async (
  userId: number,
  title: string,
  content: string,
  type: 'question' | 'article' = 'question'
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO posts (user_id, title, content, type) VALUES (?, ?, ?, ?)",
    [userId, title, content, type]
  );
  // @ts-ignore mysql2 RowDataPacket/ResultSetHeader types
  const insertId = result.insertId as number;
  return insertId;
};

export const getAllPosts = async (): Promise<PostRecord[]> => {
  const [rows] = await pool.query(
    "SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.user_id = u.user_id ORDER BY p.created_at DESC"
  );
  return rows as PostRecord[];
};

export const getPostById = async (postId: number): Promise<PostRecord | null> => {
  const [rows] = await pool.query(
    "SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
    [postId]
  );
  const arr = rows as PostRecord[];
  return arr[0] || null;
};

// LIKES 

export const createLike = async (postId: number, userId: number): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );
  // @ts-ignore
  return result.insertId as number;
};

export const deleteLike = async (postId: number, userId: number): Promise<boolean> => {
  const [result] = await pool.query(
    "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

export const getLikeCount = async (postId: number): Promise<number> => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
    [postId]
  );
  // @ts-ignore
  return rows[0].count;
};

export const checkUserLiked = async (postId: number, userId: number): Promise<boolean> => {
  const [rows] = await pool.query(
    "SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1",
    [postId, userId]
  );
  // @ts-ignore
  return rows.length > 0;
};

// ============ COMMENTS ============

export const createComment = async (
  postId: number,
  userId: number,
  content: string
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
    [postId, userId, content]
  );
  // @ts-ignore
  return result.insertId as number;
};

export const getCommentsByPost = async (postId: number): Promise<CommentRecord[]> => {
  const [rows] = await pool.query(
    "SELECT c.*, u.name as author_name FROM comments c JOIN users u ON c.user_id = u.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC",
    [postId]
  );
  return rows as CommentRecord[];
};

export const getCommentCount = async (postId: number): Promise<number> => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM comments WHERE post_id = ?",
    [postId]
  );
  // @ts-ignore
  return rows[0].count;
};
