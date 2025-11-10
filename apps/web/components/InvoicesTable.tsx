"use client";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetcher";

export default function InvoicesTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<any>("/api/invoices")
      .then((data: any) => setRows(data.rows || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading table...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium mb-2">Invoices</h3>
      <table className="w-full text-sm border-t">
        <thead className="text-left text-gray-500">
          <tr>
            <th>Vendor</th>
            <th>Date</th>
            <th>Invoice #</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td>{r.vendorName}</td>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td>{r.invoiceId}</td>
              <td>${r.amount}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
