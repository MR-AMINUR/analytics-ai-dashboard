"use client";

import { useEffect, useState } from "react";
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
import DashboardLayout from "./layouts/DashboardLayout";

type AnyObj = Record<string, any>;

function ensureArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  if (typeof v === "object" && Array.isArray((v as any).rows)) return (v as any).rows as T[];
  if (typeof v === "object" && Array.isArray((v as any).data)) return (v as any).data as T[];
  return [];
}

function fmtCurrency(n: any) {
  const num = Number(n ?? 0);
  try {
    return `€${num.toLocaleString()}`;
  } catch {
    return `€${num}`;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AnyObj | null>(null);
  const [trends, setTrends] = useState<AnyObj[]>([]);
  const [vendors, setVendors] = useState<AnyObj[]>([]);
  const [categories, setCategories] = useState<AnyObj[]>([]);
  const [cashflow, setCashflow] = useState<AnyObj[]>([]);
  const [invoices, setInvoices] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#10b981", "#facc15"];

  // transform helpers to normalize shapes for charts
  function transformTrends(raw: any[]): AnyObj[] {
    return (raw || []).map((r: any) => ({
      month: r.month ?? r.label ?? r.date ?? r.name ?? "",
      invoiceCount: Number(r.invoiceCount ?? r.invoice_count ?? r.count ?? 0),
      totalAmount: Number(r.totalAmount ?? r.total_spend ?? r.amount ?? 0),
    }));
  }

  function transformVendors(raw: any[]): AnyObj[] {
    return (raw || []).map((r: any) => ({
      vendor_name: r.vendor_name ?? r.vendorName ?? r.name ?? r[0] ?? "",
      spend: Number(r.spend ?? r.total_spend ?? r.amount ?? r.value ?? 0),
    }));
  }

  function transformCategories(raw: any[]): AnyObj[] {
    return (raw || []).map((r: any) => ({
      category: r.category ?? r.sachkonto ?? r.name ?? "Uncategorized",
      spend: Number(r.spend ?? r.total_price ?? r.amount ?? r.value ?? 0),
    }));
  }

  function transformCashflow(raw: any[]): AnyObj[] {
    return (raw || []).map((r: any) => ({
      date: r.date ?? r.due_date ?? r.range ?? "",
      amount: Number(r.amount ?? r.value ?? r.discounted_total ?? 0),
    }));
  }

  function transformInvoices(raw: any[]): AnyObj[] {
    return (raw || []).map((r: any) => ({
      vendor_name:
        (r.vendor && (r.vendor.vendor_name ?? r.vendor.name)) ??
        r.vendor_name ??
        r.vendorName ??
        r.supplier ??
        "",
      invoice_date: r.invoice_date ?? r.date ?? r.invoiceDate ?? r.created_at ?? "",
      invoice_number: r.invoice_number ?? r.number ?? r.invoiceNumber ?? "",
      invoice_total:
        Number(r.invoice_total ?? r.total ?? r.amount ?? r.net_value ?? r.invoiceAmount ?? 0),
      status: r.status ?? (r.overdue ? "overdue" : r.state ?? "open"),
    }));
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const endpoints = [
          fetch("/api/stats").then((r) => r.ok ? r.json() : Promise.resolve(null)),
          fetch("/api/invoice-trends").then((r) => r.ok ? r.json() : Promise.resolve([])),
          fetch("/api/vendors/top10").then((r) => r.ok ? r.json() : Promise.resolve([])),
          fetch("/api/category-spend").then((r) => r.ok ? r.json() : Promise.resolve([])),
          fetch("/api/cash-outflow").then((r) => r.ok ? r.json() : Promise.resolve([])),
          fetch("/api/invoices").then((r) => r.ok ? r.json() : Promise.resolve([])),
        ];

        const [s, t, v, c, cf, ins] = await Promise.all(endpoints);

        if (!mounted) return;

        setStats(s ?? {});
        const tArr = ensureArray(t);
        const vArr = ensureArray(v);
        const cArr = ensureArray(c);
        const cfArr = ensureArray(cf);
        const insArr = ensureArray(ins);

        setTrends(transformTrends(tArr));
        setVendors(transformVendors(vArr));
        setCategories(transformCategories(cArr));
        setCashflow(transformCashflow(cfArr));
        setInvoices(transformInvoices(insArr));
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        if (!mounted) return;
        setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">Error loading dashboard: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="text-sm text-gray-500">Total Spend (YTD)</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(stats?.totalSpendYtd ?? stats?.total_spend ?? 0)}</p>
            <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="text-sm text-gray-500">Total Invoices Processed</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">{Number(stats?.totalInvoices ?? stats?.invoice_count ?? 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">+5.4% from last month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="text-sm text-gray-500">Documents Uploaded</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">{Number(stats?.documentsUploaded ?? stats?.documents_uploaded ?? 0).toLocaleString()}</p>
            <p className="text-xs text-red-600 mt-1">−1.2% from last month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h2 className="text-sm text-gray-500">Average Invoice Value</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(stats?.averageInvoiceValue ?? stats?.avg_invoice ?? stats?.avgInvoice ?? 0)}</p>
            <p className="text-xs text-green-600 mt-1">+1.2% from last month</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Volume + Spend Trend */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Volume + Value Trend</h3>
            {trends.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">No trend data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(v: number) => (typeof v === "number" ? fmtCurrency(v) : v)} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="invoiceCount" name="Invoices" stroke="#3b82f6" />
                  <Line yAxisId="right" type="monotone" dataKey="totalAmount" name="Spend" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Spend by Vendor */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Vendor (Top 10)</h3>
            {vendors.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">No vendor spend data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart layout="vertical" data={vendors} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="vendor_name" width={160} />
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                  <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 2: Category, Cashflow, Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Pie */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Category</h3>
            {Array.isArray(categories) && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categories.map((c) => ({ name: c.category, value: c.spend }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categories.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke="white" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No category data</div>
            )}
          </div>

          {/* Cash outflow */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Cash Outflow Forecast</h3>
            {cashflow.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400">No cashflow data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cashflow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Invoices</h3>
            {invoices.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400">No invoices yet</div>
            ) : (
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
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inv.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : inv.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
