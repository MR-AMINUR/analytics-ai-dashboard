// src/routes/index.ts
import { Router } from "express";
import statsRoutes from "./stats.routes";
import invoicesRoutes from "./invoices.routes";
import vendorsRoutes from "./vendors.routes";
import categoryRoutes from "./category.routes";
import cashflowRoutes from "./cashflow.routes";
import chatRoutes from "./chat.routes";

const router = Router();

router.use("/stats", statsRoutes);
router.use("/invoice-trends", invoicesRoutes);
router.use("/vendors", vendorsRoutes);
router.use("/category-spend", categoryRoutes);
router.use("/cash-outflow", cashflowRoutes);
router.use("/invoices", invoicesRoutes); // invoicesRoutes handles both /invoice-trends and /invoices; keep separate if needed
router.use("/chat-with-data", chatRoutes);

export default router;
