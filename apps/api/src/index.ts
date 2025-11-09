import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import invoiceTrendsRoute from "./routes/invoiceTrends";
import vendorsRouter from "./routes/vendors";
import categorySpendRoute from "./routes/categorySpend";
import cashOutflowRoute from "./routes/cashOutflow";
import chatRouter from "./routes/chatwithData";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/stats", statsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/invoice-trends", invoiceTrendsRoute);
app.use("/api/vendors", vendorsRouter);
app.use("/api/category-spend", categorySpendRoute);
app.use("/api/cash-outflow", cashOutflowRoute);
app.use("/api/chat-with-data", chatRouter);


app.get("/", (_req, res) => {
  res.send("🚀 Analytics AI Dashboard API is running!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});