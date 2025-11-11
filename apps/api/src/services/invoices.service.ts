// src/services/invoices.service.ts
import { prisma } from "../prisma/client";
import { startOfMonth, subMonths, format } from "date-fns";

// ========== 1. INVOICE TRENDS ==========
export const fetchInvoiceTrends = async (months = 12) => {
  const result: { month: string; totalAmount: number; invoiceCount: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = startOfMonth(subMonths(new Date(), i));
    const end = startOfMonth(subMonths(new Date(), i - 1));

    const data = await prisma.invoices.aggregate({
      _sum: { invoice_total: true },
      _count: { invoice_id: true },
      where: { invoice_date: { gte: start, lt: end } },
    });

    result.push({
      month: format(start, "MMM"), // Jan, Feb, Mar...
      totalAmount: Number(data._sum.invoice_total ?? 0),
      invoiceCount: Number(data._count.invoice_id ?? 0),
    });
  }

  return result;
};

// ========== 2. DASHBOARD RECENT INVOICES ==========
export const fetchDashboardInvoices = async (limit = 9) => {
  const invoices = await prisma.invoices.findMany({
    take: limit,
    orderBy: { invoice_date: "desc" },
    include: { vendors: true },
  });

  return invoices.map((inv) => ({
    vendor_name: inv.vendors?.vendor_name ?? "Unknown Vendor",
    invoice_date: format(inv.invoice_date, "yyyy-MM-dd"),
    invoice_total: Number(inv.invoice_total ?? 0),
  }));
};

// ========== 3. PAGINATED INVOICE LIST ==========
export const listInvoicesService = async (params: any) => {
  const {
    page = 1,
    pageSize = 25,
    vendor,
    invoiceNumber,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortBy = "invoice_date",
    sortOrder = "desc",
    search,
  } = params;

  const where: any = {};

  if (vendor)
    where.vendors = { vendor_name: { contains: vendor, mode: "insensitive" } };

  if (invoiceNumber)
    where.invoice_number = { contains: invoiceNumber, mode: "insensitive" };

  if (dateFrom || dateTo) {
    where.invoice_date = {};
    if (dateFrom) where.invoice_date.gte = new Date(dateFrom);
    if (dateTo) where.invoice_date.lte = new Date(dateTo);
  }

  if (minAmount || maxAmount) {
    where.invoice_total = {};
    if (minAmount) where.invoice_total.gte = minAmount;
    if (maxAmount) where.invoice_total.lte = maxAmount;
  }

  if (search) {
    where.OR = [
      { invoice_number: { contains: search, mode: "insensitive" } },
      { vendors: { vendor_name: { contains: search, mode: "insensitive" } } },
      { customers: { customer_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const total = await prisma.invoices.count({ where });

  const data = await prisma.invoices.findMany({
    where,
    include: {
      vendors: true,
      customers: true,
      payments: true,
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const now = new Date();
  const rows = data.map((inv) => {
    const overdue = inv.payments?.some((p) => p.due_date && p.due_date < now);
    return {
      invoice_id: inv.invoice_id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      amount: Number(inv.invoice_total ?? 0),
      currency: inv.currency_symbol,
      vendor: inv.vendors
        ? { vendor_id: inv.vendors.vendor_id, vendor_name: inv.vendors.vendor_name }
        : null,
      customer: inv.customers
        ? { customer_id: inv.customers.customer_id, customer_name: inv.customers.customer_name }
        : null,
      status: overdue ? "overdue" : "pending",
    };
  });

  return { total, page, pageSize, rows };
};

// ========== 4. INVOICES BY VENDOR (Dashboard Right Table) ==========
export const fetchInvoicesByVendor = async (limit = 10) => {
  const grouped = await prisma.invoices.groupBy({
    by: ["vendor_id"],
    _sum: { invoice_total: true },
    _max: { invoice_date: true },
    where: {
      invoice_total: { not: null },
      document_type: { not: "creditNote" },
    },
    orderBy: { _sum: { invoice_total: "desc" } },
    take: limit,
  });

  const vendorIds = grouped.map((g) => g.vendor_id);
  const vendors = await prisma.vendors.findMany({
    where: { vendor_id: { in: vendorIds } },
    select: { vendor_id: true, vendor_name: true },
  });

  const vendorMap = new Map(vendors.map((v) => [v.vendor_id, v.vendor_name]));

  return grouped.map((g) => ({
    vendor_id: g.vendor_id,
    vendor_name: vendorMap.get(g.vendor_id) ?? "Unknown Vendor",
    latest_invoice_date: g._max.invoice_date,
    total_spend: Number(g._sum.invoice_total ?? 0),
  }));
};
