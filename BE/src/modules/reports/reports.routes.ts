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

router.use(authenticateToken);

router.post("/", createReportController);

router.get("/", getAllReportsController);

router.get("/:id", getReportByIdController);

router.put("/:id/status", updateReportStatusController);

router.delete("/:id", deleteReportController);

export default router;
