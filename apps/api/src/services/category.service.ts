// src/services/category.service.ts
import { prisma } from "../prisma/client";

/**
 * Group spend by invoice_line_items.sachkonto
 * fallback to 'Uncategorized' if sachkonto is null/empty
 */
export const fetchCategorySpend = async (limit = 10) => {
  // Group by sachkonto and sum total_price
  const cat = await prisma.invoice_line_items.groupBy({
    by: ["sachkonto"],
    _sum: { total_price: true },
    orderBy: { _sum: { total_price: "desc" } },
    take: limit,
  });

  return cat.map((c) => ({
    category: c.sachkonto ?? "Uncategorized",
    spend: Number(c._sum.total_price ?? 0),
  }));
};
