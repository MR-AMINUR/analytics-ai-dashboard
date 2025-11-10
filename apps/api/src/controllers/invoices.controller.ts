// src/controllers/invoices.controller.ts
import { Request, Response } from "express";
import { fetchInvoiceTrends, listInvoicesService } from "../services/invoices.service";

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

export const listInvoices = async (req: Request, res: Response) => {
  try {
    const q = req.query;
    const result = await listInvoicesService({
      page: Number(q.page ?? 1),
      pageSize: Number(q.pageSize ?? 25),
      vendor: q.vendor as string | undefined,
      invoiceNumber: q.invoiceNumber as string | undefined,
      dateFrom: q.dateFrom as string | undefined,
      dateTo: q.dateTo as string | undefined,
      minAmount: q.minAmount ? Number(q.minAmount) : undefined,
      maxAmount: q.maxAmount ? Number(q.maxAmount) : undefined,
      sortBy: (q.sortBy as string) || "invoice_date",
      sortOrder: (q.sortOrder as "asc" | "desc") || "desc",
      search: q.search as string | undefined,
    });
    res.json(result);
  } catch (err) {
    console.error("listInvoices error:", err);
    res.status(500).json({ error: "Failed to list invoices" });
  }
};
