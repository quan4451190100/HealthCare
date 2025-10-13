import { Router } from "express";
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportStatusController,
  deleteReportController
} from "./reports.controller";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// POST /reports - Tạo report mới (user báo cáo bài viết)
router.post("/", createReportController);

// GET /reports - Lấy tất cả reports (admin only)
router.get("/", getAllReportsController);

// GET /reports/:id - Lấy report theo ID (admin only)
router.get("/:id", getReportByIdController);

// PUT /reports/:id/status - Cập nhật trạng thái report (admin only)
router.put("/:id/status", updateReportStatusController);

// DELETE /reports/:id - Xóa report (admin only)
router.delete("/:id", deleteReportController);

export default router;
