// src/services/invoices.service.ts
import { prisma } from "../prisma/client";
import { startOfMonth, subMonths, format } from "date-fns";

type ListParams = {
  page?: number;
  pageSize?: number;
  vendor?: string;
  invoiceNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
};

export const fetchInvoiceTrends = async (months = 12) => {
  const result: { month: string; totalAmount: number; invoiceCount: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = startOfMonth(subMonths(new Date(), i));
    const end = startOfMonth(subMonths(new Date(), i - -1)); // start of next month
    const data = await prisma.invoices.aggregate({
      _sum: { invoice_total: true },
      _count: { invoice_id: true },
      where: {
        invoice_date: {
          gte: start,
          lt: end,
        },
      },
    });
    result.push({
      month: format(start, "yyyy-MM"),
      totalAmount: Number(data._sum.invoice_total ?? 0),
      invoiceCount: Number(data._count.invoice_id ?? 0),
    });
  }

  return result;
};

export const listInvoicesService = async (params: ListParams) => {
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

  if (vendor) {
    where.vendors = {
      vendor_name: { contains: vendor, mode: "insensitive" },
    };
  }

  if (invoiceNumber) {
    where.invoice_number = { contains: invoiceNumber, mode: "insensitive" };
  }

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

  // total count
  const total = await prisma.invoices.count({ where });

  // fetch rows with relations
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

  // map to expected minimal response
  const rows = data.map((inv) => {
    // derive status: naive - if any payment due_date past today, mark overdue
    const now = new Date();
    const overdue =
      inv.payments && inv.payments.some((p) => p.due_date && p.due_date < now);
    return {
      invoice_id: inv.invoice_id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      amount: Number(inv.invoice_total ?? 0),
      currency: inv.currency_symbol,
      vendor: inv.vendors ? { vendor_id: inv.vendors.vendor_id, vendor_name: inv.vendors.vendor_name } : null,
      customer: inv.customers ? { customer_id: inv.customers.customer_id, customer_name: inv.customers.customer_name } : null,
      status: overdue ? "overdue" : "pending",
    };
  });

  return {
    total,
    page,
    pageSize,
    rows,
  };
};
