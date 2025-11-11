"use client";

import { useEffect, useState, useMemo } from "react";

type Invoice = {
  id: string | number;
  vendor: string;
  date: string;
  number: string;
  amount: number;
  currency?: string;
  status: string;
};

function ensureArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  if (typeof v === "object" && Array.isArray((v as any).rows)) return (v as any).rows;
  if (typeof v === "object" && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function fmtCurrency(n: any, symbol = "€") {
  const num = Number(n ?? 0);
  try {
    return `${symbol}${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `${symbol}${num}`;
  }
}

export default function InvoicesPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Invoice>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // === Fetch invoices ===
  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/invoices`);
        if (!res.ok) throw new Error("Failed to fetch invoices");

        const data = await res.json();
        const arr = ensureArray<Invoice>(data);

        // ✅ Normalize backend fields
        const normalized = arr.map((inv: any, idx: number) => ({
          id: inv.invoice_id ?? inv.id ?? idx,
          vendor:
            inv.vendor_name ??
            inv.vendorName ??
            inv.vendors?.vendor_name ?? // ✅ backend has "vendors"
            inv.vendor?.vendor_name ??
            "Unknown Vendor",
          date: inv.invoice_date ?? inv.date ?? inv.created_at ?? "",
          number: inv.invoice_number ?? inv.number ?? inv.invoiceNumber ?? "-",
          amount: Number(inv.invoice_total ?? inv.total ?? inv.amount ?? 0),
          currency: inv.currency_symbol ?? inv.currency ?? "€",
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
  }, [API_BASE]);

  // === Filter + Sort ===
  const filteredInvoices = useMemo(() => {
    let data = invoices;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (inv) =>
          inv.vendor.toLowerCase().includes(q) ||
          inv.number.toLowerCase().includes(q)
      );
    }

    data = [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return data;
  }, [invoices, search, sortBy, sortDir]);

  const handleSort = (key: keyof Invoice) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // === Render ===
  if (loading)
    return <div className="p-6 text-gray-500">Loading invoices...</div>;
  if (error)
    return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#1C1C1C]">Invoices</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor or invoice #"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow border max-h-[75vh] overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No invoices found</div>
        ) : (
          <table className="min-w-full text-sm text-left border-t">
            <thead className="sticky top-0 bg-gray-50 text-xs text-gray-600 border-b shadow-sm">
              <tr>
                <th
                  onClick={() => handleSort("vendor")}
                  className="py-2 px-3 cursor-pointer hover:text-indigo-600"
                >
                  Vendor {sortBy === "vendor" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="py-2 px-3 cursor-pointer hover:text-indigo-600"
                >
                  Date {sortBy === "date" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("number")}
                  className="py-2 px-3 cursor-pointer hover:text-indigo-600"
                >
                  Invoice # {sortBy === "number" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="py-2 px-3 text-right cursor-pointer hover:text-indigo-600"
                >
                  Amount {sortBy === "amount" && (sortDir === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-3">{inv.vendor}</td>
                  <td className="py-2 px-3">
                    {inv.date
                      ? new Date(inv.date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="py-2 px-3">{inv.number}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-800">
                    {fmtCurrency(inv.amount, inv.currency)}
                  </td>
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
