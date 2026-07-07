import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "name", "coins"],
      order: [["coins", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      totalUsers: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      leaderboard: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const rechargeCoins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, coins } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update({
      coins,
    });

    res.status(200).json({
      message: "Coins updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};