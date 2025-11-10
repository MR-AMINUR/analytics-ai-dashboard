"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: string | number;
  vendor: string;
  date: string;
  number: string;
  amount: number;
  status: string;
};

function ensureArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  if (typeof v === "object" && Array.isArray((v as any).rows)) return (v as any).rows;
  if (typeof v === "object" && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function fmtCurrency(n: any) {
  const num = Number(n ?? 0);
  try {
    return `€${num.toLocaleString()}`;
  } catch {
    return `€${num}`;
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4000/api/invoices");

        if (!res.ok) throw new Error("Failed to fetch invoices");
        const data = await res.json();
        const arr = ensureArray<Invoice>(data);

        // Normalize inconsistent keys from backend
        const normalized = arr.map((inv: any, idx: number) => ({
          id: inv.id ?? idx,
          vendor:
            inv.vendor_name ??
            inv.vendorName ??
            (inv.vendor && (inv.vendor.vendor_name ?? inv.vendor.name)) ??
            "Unknown Vendor",
          date: inv.invoice_date ?? inv.date ?? inv.created_at ?? "",
          number: inv.invoice_number ?? inv.number ?? inv.invoiceNumber ?? "-",
          amount: Number(inv.invoice_total ?? inv.total ?? inv.amount ?? 0),
          status:
            inv.status ??
            (inv.overdue ? "overdue" : inv.state ?? "open"),
        }));

        setInvoices(normalized);
      } catch (err: any) {
        console.error("Failed to load invoices:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading invoices...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <div className="overflow-x-auto rounded-xl bg-white shadow border">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No invoices found</div>
        ) : (
          <table className="min-w-full text-sm text-left border-t">
            <thead className="text-xs text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Vendor</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Invoice #</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{inv.id}</td>
                  <td className="py-2 px-3">{inv.vendor}</td>
                  <td className="py-2 px-3">{inv.date}</td>
                  <td className="py-2 px-3">{inv.number}</td>
                  <td className="py-2 px-3 text-right">{fmtCurrency(inv.amount)}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
