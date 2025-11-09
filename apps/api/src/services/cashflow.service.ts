// src/services/cashflow.service.ts
import { prisma } from "../prisma/client";
import { addDays } from "date-fns";

export const fetchCashOutflow = async (start?: Date, end?: Date) => {
  const today = new Date();
  const defaultStart = start ?? today;
  const defaultEnd = end ?? addDays(today, 30);

  // Query payments by due_date between start and end
  const payments = await prisma.payments.findMany({
    where: {
      due_date: {
        gte: defaultStart,
        lte: defaultEnd,
      },
    },
    select: {
      payment_id: true,
      due_date: true,
      discounted_total: true,
      invoices: {
        select: {
          invoice_total: true,
        },
      },
    },
    orderBy: { due_date: "asc" },
  });

  // Build grouped by date
  const map = new Map<string, number>();
  payments.forEach((p) => {
    const key = p.due_date ? p.due_date.toISOString().slice(0, 10) : "unknown";
    const amount = Number(p.discounted_total ?? p.invoices.invoice_total ?? 0);
    map.set(key, (map.get(key) ?? 0) + amount);
  });

  const rows = Array.from(map.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));

  return {
    start: defaultStart.toISOString(),
    end: defaultEnd.toISOString(),
    rows,
  };
};
