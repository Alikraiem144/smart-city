import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export const checkCoins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (Number(user.coins) <= 0) {
      return res.status(401).json({
        message: "Insufficient coins",
      });
    }

    await user.update({
      coins: Number(user.coins) - 1,
    });

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};