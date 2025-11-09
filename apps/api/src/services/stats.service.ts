// src/services/stats.service.ts
import { prisma } from "../prisma/client";
import { subYears, startOfYear } from "date-fns";

export const fetchStats = async () => {
  // Total Spend YTD
  const startOfThisYear = startOfYear(new Date());
  const totalSpendYtdResult = await prisma.invoices.aggregate({
    _sum: { invoice_total: true },
    where: {
      invoice_date: { gte: startOfThisYear },
    },
  });

  const totalSpendYtd = Number(totalSpendYtdResult._sum.invoice_total ?? 0);

  // Total Invoices Processed (all time)
  const totalInvoices = await prisma.invoices.count();

  // Documents Uploaded - interpret as number of invoices that have a document_type (non-null)
  const documentsUploaded = await prisma.invoices.count({
    where: { document_type: { not: "" } },
  });

  // Average Invoice Value (all invoices)
  const sumAll = await prisma.invoices.aggregate({
    _sum: { invoice_total: true },
  });
  const sumAllVal = Number(sumAll._sum.invoice_total ?? 0);
  const avgInvoiceValue = totalInvoices > 0 ? sumAllVal / totalInvoices : 0;

  return {
    totalSpendYtd,
    totalInvoices,
    documentsUploaded,
    averageInvoiceValue: Number(avgInvoiceValue.toFixed(2)),
  };
};
