"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../src/app/layouts/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Page() {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [s, t, v, c, cf, ins] = await Promise.all([
          fetch("/api/stats").then((r) => r.json()),
          fetch("/api/invoice-trends").then((r) => r.json()),
          fetch("/api/vendors/top10").then((r) => r.json()),
          fetch("/api/category-spend").then((r) => r.json()),
          fetch("/api/cash-outflow").then((r) => r.json()),
          fetch("/api/invoices").then((r) => r.json()),
        ]);

        setStats(s ?? {});
        setTrends(Array.isArray(t) ? t : []);
        setVendors(Array.isArray(v) ? v : []);
        setCategories(Array.isArray(c) ? c : []);
        setCashflow(Array.isArray(cf) ? cf : []);
        setInvoices(Array.isArray(ins) ? ins : []);
      } catch (err: any) {
        console.error("Dashboard load failed:", err);
        setError(err.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Error: {error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spend (YTD)"
            value={`€${stats?.totalSpendYtd?.toLocaleString() ?? "0"}`}
            change="+8.2% from last month"
            positive
          />
          <StatCard
            title="Total Invoices Processed"
            value={stats?.totalInvoices ?? "0"}
            change="+5.4% from last month"
            positive
          />
          <StatCard
            title="Documents Uploaded"
            value={stats?.documentsUploaded ?? "0"}
            change="+2.1% from last month"
            positive
          />
          <StatCard
            title="Average Invoice Value"
            value={`€${stats?.averageInvoiceValue?.toLocaleString() ?? "0"}`}
            change="+1.2% from last month"
            positive
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Volume & Spend Trend */}
          <ChartCard title="Invoice Volume + Value Trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="invoiceCount"
                  name="Invoices"
                  stroke="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalAmount"
                  name="Spend (€)"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Spend by Vendor */}
          <ChartCard title="Spend by Vendor (Top 10)">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={vendors} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="vendor_name"
                  width={180}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Bar dataKey="spend" name="Spend (€)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spend by Category */}
          <ChartCard title="Spend by Category">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categories.map((c) => ({
                    name: c.category ?? "Uncategorized",
                    value: c.spend ?? 0,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {categories.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="white"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [
                    `€${v.toLocaleString()}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Cash Flow Forecast */}
          <ChartCard title="Cash Outflow Forecast">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Invoices Table */}
          <ChartCard title="Recent Invoices">
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left py-2 px-2">Vendor</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Invoice #</th>
                    <th className="text-right py-2 px-2">Amount</th>
                    <th className="text-center py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((inv, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-2">{inv.vendor_name}</td>
                      <td className="py-2 px-2">{inv.date}</td>
                      <td className="py-2 px-2">{inv.invoice_number}</td>
                      <td className="py-2 px-2 text-right">
                        €{inv.amount?.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            inv.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : inv.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {inv.status ?? "open"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  change,
  positive = true,
}: {
  title: string;
  value: string | number;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <h2 className="text-xs text-gray-500">{title}</h2>
      <p className="text-2xl font-semibold mt-2 text-gray-900">{value}</p>
      <p
        className={`text-xs mt-1 font-medium ${
          positive ? "text-green-600" : "text-red-600"
        }`}
      >
        {change}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <h2 className="text-sm font-medium text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}
