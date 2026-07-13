import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const PUBLIC_KEY = process.env.PUBLIC_KEY?.replace(/\\n/g, "\n");

if (!PUBLIC_KEY) {
  throw new Error("PUBLIC_KEY is missing");
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};