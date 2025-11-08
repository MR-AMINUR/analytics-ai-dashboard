"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoice-trends")
      .then((res) => res.json())
      .then((data) => setTrends(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading invoice trends...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📈 Invoice Trends</h1>

      <div className="bg-white p-4 rounded-xl shadow">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
