import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import vendorsRouter from "./routes/vendors";
import chatRouter from "./routes/chatwithData";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/stats", statsRouter);
app.use("/invoices", invoicesRouter);
app.use("/vendors", vendorsRouter);
app.use("/chat-with-data", chatRouter);

const PORT = process.env.PORT || 5000;

app.get("/", (_req, res) => {
  res.send("🚀 Analytics AI Dashboard API is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
