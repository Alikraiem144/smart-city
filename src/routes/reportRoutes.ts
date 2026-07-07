import { Router } from "express";
import { body } from "express-validator";

import {
  createReport,
  getReports,
  getMyReports,
  getStatistics,
  exportStatistics,
  clusterReports,
  nearbyReports,
  updateReport,
  updateReportStatus,
  bulkUpdateReportStatus,
  deleteReport,
} from "../controllers/reportController";

import { protect } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/adminMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { checkCoins } from "../middlewares/coinsMiddleware";

const router = Router();

// User routes
router.post(
  "/",
  protect,
  checkCoins,
  [
    body("latitude").isFloat().withMessage("latitude must be a number"),
    body("longitude").isFloat().withMessage("longitude must be a number"),
    body("defectType").notEmpty().withMessage("defectType is required"),
    body("severity").notEmpty().withMessage("severity is required"),
  ],
  validateRequest,
  createReport
);

router.get("/", protect, checkCoins, getReports);
router.get("/me", protect, checkCoins, getMyReports);

// Statistics routes
router.get("/statistics", protect, checkCoins, getStatistics);
router.get("/statistics/export", protect, checkCoins, exportStatistics);

// Clustering route
router.get("/clusters", protect, checkCoins, clusterReports);

// Nearby reports route
router.get("/nearby", protect, checkCoins, nearbyReports);

// Admin routes
router.put(
  "/bulk-status",
  protect,
  adminOnly,
  [
    body("ids").isArray({ min: 1 }).withMessage("ids must be a non-empty array"),
    body("status")
      .isIn(["VALIDATED", "REJECTED"])
      .withMessage("status must be VALIDATED or REJECTED"),
  ],
  validateRequest,
  bulkUpdateReportStatus
);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  [
    body("status")
      .isIn(["VALIDATED", "REJECTED"])
      .withMessage("status must be VALIDATED or REJECTED"),
  ],
  validateRequest,
  updateReportStatus
);

// Routes with ID
router.put("/:id", protect, checkCoins, updateReport);
router.delete("/:id", protect, checkCoins, deleteReport);

export default router;