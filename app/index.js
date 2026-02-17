import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import routeHandler from "./routes/index.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.set("query parser", "extended");
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	})
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running",
  });
});
app.use("/api/v1", routeHandler);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Server error",
  });
});

export default app;