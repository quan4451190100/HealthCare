import { Router } from "express";
import {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController
} from "./notifications.controller";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /notifications - Lấy tất cả notifications của user
router.get("/", getNotificationsController);

// PUT /notifications/:id/read - Đánh dấu 1 notification đã đọc
router.put("/:id/read", markAsReadController);

// PUT /notifications/read-all - Đánh dấu tất cả đã đọc
router.put("/read-all", markAllAsReadController);

// DELETE /notifications/:id - Xóa notification
router.delete("/:id", deleteNotificationController);

export default router;
