import { Router } from "express";
import {
  getLeaderboard,
  rechargeCoins,
} from "../controllers/userController";

import { protect } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/adminMiddleware";

const router = Router();

// Public leaderboard
router.get("/leaderboard", protect, getLeaderboard);

// Admin recharge coins
router.put(
  "/recharge",
  protect,
  adminOnly,
  rechargeCoins
);

export default router;