// src/services/vendors.service.ts
import { prisma } from "../prisma/client";

export const fetchTopVendors = async (limit = 10) => {
  // Aggregate invoice totals by vendor
  const data = await prisma.invoices.groupBy({
    by: ["vendor_id"],
    _sum: { invoice_total: true },
    orderBy: { _sum: { invoice_total: "desc" } },
    take: limit,
  });

  // Get vendor details
  const vendorIds = data.map((d) => d.vendor_id);
  const vendors = await prisma.vendors.findMany({
    where: { vendor_id: { in: vendorIds } },
  });

  const vendorMap = new Map(vendors.map((v) => [v.vendor_id.toString(), v]));

  return data.map((d) => ({
    vendor_id: d.vendor_id,
    vendor_name: vendorMap.get(String(d.vendor_id))?.vendor_name ?? null,
    spend: Number(d._sum.invoice_total ?? 0),
  }));
};
