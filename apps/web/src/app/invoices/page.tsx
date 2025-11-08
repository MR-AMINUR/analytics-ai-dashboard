"use client";

import { useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading invoices...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">🧾 Invoices</h1>
      <table className="min-w-full border border-gray-200 bg-white shadow rounded-xl">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Vendor</th>
            <th className="p-3 text-left">Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-3">{inv.id}</td>
              <td className="p-3">{inv.vendor}</td>
              <td className="p-3">{inv.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
