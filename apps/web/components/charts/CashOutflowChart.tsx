"use client";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CashOutflowChart() {
  const { data } = useSWR("/api/cash-outflow", () => fetchJson<any>("/api/cash-outflow"));
  if (!data) return <div>Loading...</div>;
  const rows = data.rows.map((r: any) => ({ date: new Date(r.date).toLocaleDateString(), total: r.total }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium mb-2">Cash Outflow Forecast</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#fb7185" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
