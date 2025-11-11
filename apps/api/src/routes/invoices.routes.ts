import { Router } from "express";
import {
  getInvoiceTrends,
  listInvoices,
  getRecentInvoices,
  getInvoicesByVendor,
} from "../controllers/invoices.controller";

const router = Router();

// ✅ 1️⃣ Full invoice list (for /invoices page table)
router.get("/", listInvoices); // ✅ MAIN endpoint: GET /api/invoices

// ✅ 2️⃣ Trends data (for line chart)
router.get("/trends", getInvoiceTrends); // ✅ GET /api/invoices/trends

// ✅ 3️⃣ Dashboard small list (for top 9)
router.get("/recent", getRecentInvoices); // ✅ GET /api/invoices/recent

// ✅ 4️⃣ Top vendors by invoice spend
router.get("/by-vendor", getInvoicesByVendor); // ✅ GET /api/invoices/by-vendor

export default router;
