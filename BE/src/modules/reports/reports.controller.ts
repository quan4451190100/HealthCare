import type { Request, Response } from "express";
import {
  createReport,
  getAllReports,
  getReportsByStatus,
  getReportById,
  updateReportStatus,
  deleteReport,
  checkUserReportedPost
} from "./reports.model";

export const createReportController = async (req: Request, res: Response) => {
  try {
    const { post_id, reason } = req.body as { post_id: number; reason: string };
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!post_id || !reason) {
      return res.status(400).json({ message: "Post ID and reason are required" });
    }

    // Kiểm tra user đã báo cáo bài này chưa
    const alreadyReported = await checkUserReportedPost(post_id, userId);
    if (alreadyReported) {
      return res.status(400).json({ message: "Bạn đã báo cáo bài viết này rồi" });
    }

    const reportId = await createReport(post_id, userId, reason);

    return res.status(201).json({
      message: "Report created successfully",
      report_id: reportId
    });
  } catch (err: any) {
    console.error("Create report error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReportsController = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;

    // Chỉ admin mới có thể xem tất cả reports
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    const { status } = req.query;

    let reports;
    if (status && typeof status === 'string') {
      reports = await getReportsByStatus(status);
    } else {
      reports = await getAllReports();
    }

    return res.status(200).json(reports);
  } catch (err: any) {
    console.error("Get all reports error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReportByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    if (!id) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const report = await getReportById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json(report);
  } catch (err: any) {
    console.error("Get report by ID error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReportStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'pending' | 'reviewed' | 'resolved' };
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    if (!id) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const success = await updateReportStatus(reportId, status);

    if (!success) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ message: "Report status updated" });
  } catch (err: any) {
    console.error("Update report status error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReportController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    if (!id) {
      return res.status(400).json({ message: "Report ID is required" });
    }

    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const success = await deleteReport(reportId);

    if (!success) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ message: "Report deleted" });
  } catch (err: any) {
    console.error("Delete report error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
