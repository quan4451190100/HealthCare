import pool from "../../config/db";

export interface ReportRecord {
  report_id: number;
  post_id: number;
  user_id: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: Date;
}

export const createReport = async (
  postId: number,
  userId: number,
  reason: string
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO reports (post_id, user_id, reason) VALUES (?, ?, ?)",
    [postId, userId, reason]
  );
  // @ts-ignore
  return result.insertId as number;
};

export const getAllReports = async (): Promise<ReportRecord[]> => {
  const [rows] = await pool.query(
    `SELECT r.*, 
      u.name as reporter_name, 
      p.title as post_title 
     FROM reports r 
     JOIN users u ON r.user_id = u.user_id 
     JOIN posts p ON r.post_id = p.post_id 
     ORDER BY r.created_at DESC`
  );
  return rows as ReportRecord[];
};

export const getReportsByStatus = async (status: string): Promise<ReportRecord[]> => {
  const [rows] = await pool.query(
    `SELECT r.*, 
      u.name as reporter_name, 
      p.title as post_title 
     FROM reports r 
     JOIN users u ON r.user_id = u.user_id 
     JOIN posts p ON r.post_id = p.post_id 
     WHERE r.status = ?
     ORDER BY r.created_at DESC`,
    [status]
  );
  return rows as ReportRecord[];
};

export const getReportById = async (reportId: number): Promise<ReportRecord | null> => {
  const [rows] = await pool.query(
    `SELECT r.*, 
      u.name as reporter_name, 
      p.title as post_title,
      p.content as post_content
     FROM reports r 
     JOIN users u ON r.user_id = u.user_id 
     JOIN posts p ON r.post_id = p.post_id 
     WHERE r.report_id = ?`,
    [reportId]
  );
  const arr = rows as ReportRecord[];
  return arr[0] || null;
};

export const updateReportStatus = async (
  reportId: number,
  status: 'pending' | 'reviewed' | 'resolved'
): Promise<boolean> => {
  const [result] = await pool.query(
    "UPDATE reports SET status = ? WHERE report_id = ?",
    [status, reportId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

export const deleteReport = async (reportId: number): Promise<boolean> => {
  const [result] = await pool.query(
    "DELETE FROM reports WHERE report_id = ?",
    [reportId]
  );
  // @ts-ignore
  return result.affectedRows > 0;
};

export const checkUserReportedPost = async (postId: number, userId: number): Promise<boolean> => {
  const [rows] = await pool.query(
    "SELECT 1 FROM reports WHERE post_id = ? AND user_id = ? LIMIT 1",
    [postId, userId]
  );
  // @ts-ignore
  return rows.length > 0;
};
