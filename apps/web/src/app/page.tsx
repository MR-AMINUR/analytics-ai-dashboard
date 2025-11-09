"use client";

import { SetStateAction, useEffect, useState } from "react";
import {fetchStats}  from "@/src/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then((data: any) => setStats(data))
      .catch((err: { message: SetStateAction<string | null>; }) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">📊 Dashboard Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white shadow p-4">
          <h2 className="text-sm text-gray-500">Total Spend</h2>
          <p className="text-xl font-bold">${stats.totalSpend}</p>
        </div>
        <div className="rounded-xl bg-white shadow p-4">
          <h2 className="text-sm text-gray-500">Total Invoices</h2>
          <p className="text-xl font-bold">{stats.totalInvoices}</p>
        </div>
        <div className="rounded-xl bg-white shadow p-4">
          <h2 className="text-sm text-gray-500">Average Invoice</h2>
          <p className="text-xl font-bold">${stats.avgInvoice}</p>
        </div>
      </div>
    </div>
  );
}
