"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
type AnyObj = Record<string, any>;

function ensureArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  if (typeof v === "object" && Array.isArray((v as any).rows)) return (v as any).rows;
  if (typeof v === "object" && Array.isArray((v as any).data)) return (v as any).data;
  return [];
}

function fmtCurrency(n: any) {
  const num = Number(n ?? 0);
  return `€${num.toLocaleString()}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AnyObj | null>(null);
  const [trends, setTrends] = useState<AnyObj[]>([]);
  const [vendors, setVendors] = useState<AnyObj[]>([]);
  const [categories, setCategories] = useState<AnyObj[]>([]);
  const [cashflow, setCashflow] = useState<AnyObj[]>([]);
  const [invoices, setInvoices] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#10b981", "#facc15"];

  const transform = {
    trends: (r: any[]) => r.map((d) => ({
      month: d.month ?? d.label ?? "",
      invoiceCount: Number(d.invoiceCount ?? d.count ?? 0),
      totalAmount: Number(d.totalAmount ?? d.total_spend ?? 0),
    })),
    vendors: (r: any[]) => r.map((d) => ({
      vendor_name: d.vendor_name ?? d.vendorName ?? d.name ?? "",
      spend: Number(d.spend ?? d.total_spend ?? 0),
    })),
    categories: (r: any[]) => r.map((d) => ({
      category: d.category ?? d.name ?? "Uncategorized",
      spend: Number(d.spend ?? d.amount ?? 0),
    })),
    cashflow: (r: any[]) => r.map((d) => ({
      date: d.date ?? d.range ?? "",
      amount: Number(d.amount ?? d.value ?? 0),
    })),
    invoices: (r: any[]) => r.map((d) => ({
      vendor_name:
        d.vendor?.vendor_name ?? d.vendor_name ?? "Unknown",
      invoice_date: d.invoice_date ?? d.date ?? "",
      invoice_number: d.invoice_number ?? d.number ?? "-",
      invoice_total: Number(d.invoice_total ?? d.amount ?? 0),
      status: d.status ?? (d.overdue ? "overdue" : "open"),
    })),
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, trendRes, vendorRes, catRes, cashRes, invRes] = await Promise.all([
          fetch(API_BASE+"/stats"),
          fetch(API_BASE+"/invoice-trends"),
          fetch(API_BASE+"/vendors/top10"),
          fetch(API_BASE+"/category-spend"),
          fetch(API_BASE+"/cash-outflow"),
          fetch(API_BASE+"/invoices"),
        ]);
        if (!mounted) return;
        setStats(await statsRes.json());
        setTrends(transform.trends(ensureArray(await trendRes.json())));
        setVendors(transform.vendors(ensureArray(await vendorRes.json())));
        setCategories(transform.categories(ensureArray(await catRes.json())));
        setCashflow(transform.cashflow(ensureArray(await cashRes.json())));
        setInvoices(transform.invoices(ensureArray(await invRes.json())));
      } catch (e: any) {
        setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Spend (YTD)" value={fmtCurrency(stats?.totalSpendYtd ?? 0)} trend="+8.2%" />
        <Card title="Total Invoices Processed" value={stats?.totalInvoices ?? 0} trend="+5.4%" />
        <Card title="Documents Uploaded" value={stats?.documentsUploaded ?? 0} trend="−1.2%" negative />
        <Card title="Average Invoice Value" value={fmtCurrency(stats?.averageInvoiceValue ?? 0)} trend="+1.2%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartBox title="Invoice Volume + Value Trend">
          {trends.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <Tooltip />
                <Legend />
                <Line dataKey="invoiceCount" name="Invoices" stroke="#3b82f6" />
                <Line dataKey="totalAmount" name="Spend" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No trend data yet" />
          )}
        </ChartBox>

        <ChartBox title="Spend by Vendor (Top 10)">
          {vendors.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={vendors} margin={{ left: -20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="vendor_name" width={150} />
                <Tooltip />
                <Bar dataKey="spend" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No vendor spend data" />
          )}
        </ChartBox>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartBox title="Spend by Category">
          {categories.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categories} dataKey="spend" nameKey="category" outerRadius={80} label>
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No category data" />
          )}
        </ChartBox>

        <ChartBox title="Cash Outflow Forecast">
          {cashflow.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cashflow}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No cashflow data" />
          )}
        </ChartBox>

        <ChartBox title="Recent Invoices">
          {invoices.length ? (
            <div className="overflow-auto max-h-64">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="py-2 px-2 text-left">Vendor</th>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Invoice #</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 10).map((inv, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{inv.vendor_name}</td>
                      <td className="py-2 px-2">{inv.invoice_date}</td>
                      <td className="py-2 px-2">{inv.invoice_number}</td>
                      <td className="py-2 px-2 text-right">{fmtCurrency(inv.invoice_total)}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === "paid" ? "bg-green-100 text-green-700"
                          : inv.status === "overdue" ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="No invoices yet" />
          )}
        </ChartBox>
      </div>
    </div>
  );
}

function Card({ title, value, trend, negative }: { title: string; value: any; trend: string; negative?: boolean; }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className={`text-xs mt-1 ${negative ? "text-red-600" : "text-green-600"}`}>{trend} from last month</p>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="h-48 flex items-center justify-center text-gray-400">{text}</div>;
}
