"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading vendor analytics...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">🏢 Vendor Spend Overview</h1>

      <div className="h-80 bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vendors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
