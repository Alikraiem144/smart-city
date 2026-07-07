import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { sequelize } from "./config/database";

import "./models/User";
import "./models/Report";

import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import userRoutes from "./routes/userRoutes";

import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Crowd Mapping API Running");
});

// Global Error Middleware
app.use(errorHandler);

sequelize
  .sync()
  .then(() => {
    console.log("Database connected and synced");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database error:", err);
  });