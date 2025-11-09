import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app = express();

// --- Global Middleware ---
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// --- Health Check ---
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "API is healthy" });
});

// --- API Routes ---
app.use("/api", routes);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}/api`);
});
