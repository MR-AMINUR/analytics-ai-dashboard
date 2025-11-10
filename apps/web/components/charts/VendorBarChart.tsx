"use client";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function VendorBarChart() {
  const { data } = useSWR("/api/vendors/top10", () => fetchJson<any[]>("/api/vendors/top10"));
  if (!data) return <div>Loading chart...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium mb-2">Top 10 Vendors by Spend</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="vendor_name" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="spend" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
