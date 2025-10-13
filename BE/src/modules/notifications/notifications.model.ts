import pool from "../../config/db";

export interface NotificationRecord {
  noti_id: number;
  user_id: number;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export const createNotification = async (
  userId: number,
  content: string
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO notifications (user_id, content) VALUES (?, ?)",
    [userId, content]
  );
  // @ts-ignore
  return result.insertId as number;
};

export const getUserNotifications = async (userId: number): Promise<NotificationRecord[]> => {
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows as NotificationRecord[];
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  // @ts-ignore
  return rows[0].count;
};

export const markAsRead = async (notiId: number): Promise<boolean> => {
  const [result] = await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE noti_id = ?",
    [notiId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

export const markAllAsRead = async (userId: number): Promise<boolean> => {
  const [result] = await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

export const deleteNotification = async (notiId: number): Promise<boolean> => {
  const [result] = await pool.query(
    "DELETE FROM notifications WHERE noti_id = ?",
    [notiId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};
