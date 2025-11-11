// src/controllers/invoices.controller.ts
import { Request, Response } from "express";
import {
  fetchInvoiceTrends,
  listInvoicesService,
  fetchDashboardInvoices,
  fetchInvoicesByVendor,
} from "../services/invoices.service";

// ✅ Line chart
export const getInvoiceTrends = async (req: Request, res: Response) => {
  try {
    const months = Number(req.query.months ?? 12);
    const data = await fetchInvoiceTrends(months);
    res.json(data);
  } catch (err) {
    console.error("getInvoiceTrends error:", err);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
};

// ✅ Dashboard invoices table
export const getRecentInvoices = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 9);
    const data = await fetchDashboardInvoices(limit);
    res.json(data);
  } catch (err) {
    console.error("getRecentInvoices error:", err);
    res.status(500).json({ error: "Failed to fetch recent invoices" });
  }
};

// ✅ Paginated list for full invoices page
export const listInvoices = async (req: Request, res: Response) => {
  try {
    const result = await listInvoicesService(req.query);
    res.json(result);
  } catch (err) {
    console.error("listInvoices error:", err);
    res.status(500).json({ error: "Failed to list invoices" });
  }
};

// ... keep existing exports

// ✅ Invoices by Vendor table (for dashboard)
export const getInvoicesByVendor = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const data = await fetchInvoicesByVendor(limit);
    res.json(data);
  } catch (err) {
    console.error("getInvoicesByVendor error:", err);
    res.status(500).json({ error: "Failed to fetch invoices by vendor" });
  }
};

