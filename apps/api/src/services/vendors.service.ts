// src/services/vendors.service.ts
import { prisma } from "../prisma/client";

export const fetchTopVendors = async (limit = 10) => {
  // Group invoices by vendor_id and sum their total values
  const grouped = await prisma.invoices.groupBy({
    by: ["vendor_id"],
    _sum: { invoice_total: true },
    where: {
      invoice_total: { not: null },
      document_type: { not: "creditNote" }, // optional: exclude credit notes
    },
    orderBy: {
      _sum: { invoice_total: "desc" },
    },
    take: limit,
  });

  // Extract vendor IDs
  const vendorIds = grouped.map((g) => g.vendor_id);

  // Fetch vendor details for those IDs
  const vendors = await prisma.vendors.findMany({
    where: { vendor_id: { in: vendorIds } },
    select: { vendor_id: true, vendor_name: true },
  });

  const vendorMap = new Map(vendors.map((v) => [v.vendor_id, v.vendor_name]));

  // Merge data
  const result = grouped.map((g) => ({
    vendor_id: g.vendor_id,
    vendor_name: vendorMap.get(g.vendor_id) ?? "Unknown Vendor",
    spend: Number(g._sum.invoice_total ?? 0),
  }));

  return result;
};
