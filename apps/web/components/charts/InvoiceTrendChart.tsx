"use client";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export default function InvoiceTrendChart() {
  const { data } = useSWR("/api/invoice-trends", () => fetchJson<any[]>("/api/invoice-trends"));
  if (!data) return <div>Loading chart...</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium mb-2">Invoice Volume + Value Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="invoiceCount" stroke="#0ea5e9" name="Invoices" />
          <Line yAxisId="right" type="monotone" dataKey="totalSpend" stroke="#06b6d4" name="Spend" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
