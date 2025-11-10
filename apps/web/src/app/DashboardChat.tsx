// Dashboard+ChatFrontend.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
const VANNA_ENDPOINT = process.env.NEXT_PUBLIC_API_URL + "/chat-with-data"

async function safeJson(res: Response | null) {
  if (!res) throw new Error("No response from server");
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    try {
      return JSON.parse(text.replace(/\u0000/g, ""));
    } catch {
      return text;
    }
  }
}

async function apiFetch(path: string, opts: RequestInit = {}, signal?: AbortSignal) {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  let res: Response | null = null;
  try {
    res = await fetch(url, { ...opts, signal });
  } catch (err: any) {
    throw new Error(`Network error calling ${url}: ${err?.message ?? String(err)}`);
  }
  if (!res || !res.ok) {
    const status = res?.status ?? "no-response";
    let body = "";
    try {
      body = await (res ? res.text() : Promise.resolve(""));
    } catch (_) {
      body = "";
    }
    throw new Error(`API ${url} failed: ${status} ${body}`);
  }
  const out = await safeJson(res);
  return out;
}

export async function fetchStats(signal?: AbortSignal) {
  return apiFetch("/stats", {}, signal);
}
export async function fetchInvoiceTrends(signal?: AbortSignal) {
  return apiFetch("/invoice-trends", {}, signal);
}
export async function fetchTopVendors(signal?: AbortSignal) {
  return apiFetch("/vendors/top10", {}, signal);
}
export async function fetchCategorySpend(signal?: AbortSignal) {
  return apiFetch("/category-spend", {}, signal);
}
export async function fetchCashOutflow(signal?: AbortSignal) {
  return apiFetch("/cash-outflow", {}, signal);
}
export async function fetchInvoices(query = "", signal?: AbortSignal) {
  const suffix = query && query.startsWith("?") ? query : query ? `?${query}` : "";
  return apiFetch(`/invoices${suffix}`, {}, signal);
}

export async function chatWithData(question: string) {
  let res: Response | null = null;
  try {
    res = await fetch(VANNA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch (err: any) {
    throw new Error(`Network error calling Vanna: ${err?.message ?? String(err)}`);
  }
  if (!res || !res.ok) {
    const status = res?.status ?? "no-response";
    const txt = res ? await res.text().catch(() => "") : "";
    throw new Error(`Vanna error: ${status} ${txt}`);
  }
  return safeJson(res);
}

function Card({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <div className="mb-3 font-medium text-sm">{title}</div>
      {children}
    </div>
  );
}

function safeNumber(v: any) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.+-eE]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getField(obj: any, keys: string[]) {
  if (obj == null) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  }
  return undefined;
}

function formatCurrency(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
  } catch {
    return `€ ${n.toLocaleString()}`;
  }
}

function formatDate(d: any) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString();
}

export default function DashboardMain() {
  const [stats, setStats] = useState<any>({});
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, t, v, c, cf, ins] = await Promise.all([
          fetchStats(signal).catch((e) => ({ _error: String(e) })),
          fetchInvoiceTrends(signal).catch((e) => ({ _error: String(e) })),
          fetchTopVendors(signal).catch((e) => ({ _error: String(e) })),
          fetchCategorySpend(signal).catch((e) => ({ _error: String(e) })),
          fetchCashOutflow(signal).catch((e) => ({ _error: String(e) })),
          fetchInvoices("", signal).catch((e) => ({ _error: String(e) })),
        ]);

        if (s && (s as any)._error) throw new Error((s as any)._error);
        setStats(s ?? {});

        const tRaw = Array.isArray(t) ? t : t?.rows ?? [];
        setTrends(
          (tRaw || []).map((r: any) => ({
            month: (getField(r, ["month", "date", "label"]) ?? "") as string,
            invoiceCount: safeNumber(getField(r, ["invoiceCount", "invoice_count", "count"])),
            totalAmount: safeNumber(getField(r, ["totalAmount", "total_spend", "amount", "sum"])),
          }))
        );

        const vRaw = Array.isArray(v) ? v : v?.rows ?? [];
        setVendors(
          (vRaw || []).map((r: any) => ({
            vendor_name: (getField(r, ["vendor_name", "vendorName", "name"]) ?? "") as string,
            spend: safeNumber(getField(r, ["spend", "total_spend", "amount", "total"])),
          }))
        );

        const cRaw = Array.isArray(c) ? c : c?.rows ?? [];
        setCategories(
          (cRaw || []).map((r: any) => ({
            category: (getField(r, ["category", "sachkonto"]) ?? "Uncategorized") as string,
            spend: safeNumber(getField(r, ["spend", "total_price", "amount"])),
          }))
        );

        const cfRaw = Array.isArray(cf) ? cf : cf?.rows ?? [];
        setCashflow(
          (cfRaw || []).map((r: any) => ({
            date: (getField(r, ["date", "due_date", "range"]) ?? "") as string,
            amount: safeNumber(getField(r, ["amount", "value", "discounted_total"])),
          }))
        );

        const insRaw = Array.isArray(ins) ? ins : ins?.rows ?? [];
        setInvoices(
          (insRaw || []).map((r: any, i: number) => {
            const vendorObj = getField(r, ["vendor"]);
            let vendorName = "";
            if (vendorObj && typeof vendorObj === "object") vendorName = vendorObj.vendor_name ?? vendorObj.name ?? "";
            if (!vendorName) vendorName = (getField(r, ["vendor_name", "vendorName"]) ?? getField(r, ["vendor"]) ?? "") as string;
            return {
              key: String(getField(r, ["invoice_id", "id"]) ?? i),
              vendor_name: vendorName,
              invoice_date: getField(r, ["invoice_date", "date"]) ?? getField(r, ["invoiceDate"]) ?? "",
              invoice_number: getField(r, ["invoice_number", "number"]) ?? "",
              invoice_total: safeNumber(getField(r, ["invoice_total", "amount", "total"])),
              status: getField(r, ["status"]) ?? (getField(r, ["overdue"]) ? "Overdue" : "Open"),
            };
          })
        );
      } catch (err: any) {
        if (err && (err as any).name === "AbortError") return;
        console.error("dashboard load error", err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <nav className="space-x-3">
          <Link href="/chat-with-data" className="text-indigo-600 hover:underline">
            Chat with Data
          </Link>
        </nav>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card
          title="Total Spend (YTD)"
          value={formatCurrency(safeNumber(getField(stats, ["totalSpendYtd", "totalSpend", "total_spend"])))}
        />
        <Card title="Total Invoices Processed" value={safeNumber(getField(stats, ["totalInvoices", "invoiceCount", "total_invoices"]))} />
        <Card title="Documents Uploaded" value={safeNumber(getField(stats, ["documentsUploaded", "documents_uploaded"]))} />
        <Card
          title="Average Invoice Value"
          value={formatCurrency(safeNumber(getField(stats, ["averageInvoiceValue", "avgInvoiceValue", "average_invoice_value"])))}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Invoice Volume + Value Trend">
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="invoiceCount" name="Invoices" />
                <Line yAxisId="right" type="monotone" dataKey="totalAmount" name="Spend" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Spend by Vendor (Top 10)">
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={vendors} margin={{ left: -20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="vendor_name" width={200} />
                <Tooltip />
                <Bar dataKey="spend" name="Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <ChartCard title="Spend by Category">
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="spend" nameKey="category" outerRadius={80} label />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Cash Outflow Forecast">
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Invoices (recent)">
          <div className="overflow-auto max-h-60">
            <table className="w-full text-sm table-auto">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Invoice #</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 20).map((r) => (
                  <tr key={r.key} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{r.vendor_name}</td>
                    <td className="px-3 py-2">{formatDate(r.invoice_date)}</td>
                    <td className="px-3 py-2">{r.invoice_number}</td>
                    <td className="px-3 py-2">{formatCurrency(r.invoice_total)}</td>
                    <td className="px-3 py-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}

export function ChatWithData() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResult(null);
    if (!question || !question.trim()) {
      setError("Please enter a question");
      return;
    }
    setLoading(true);
    try {
      const res = await chatWithData(question.trim());
      const data = res?.data ?? res?.rows ?? [];
      setResult({ sql: res?.sql ?? "", data: Array.isArray(data) ? data : [] });
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chat with Data</h1>
        <Link href="/" className="text-indigo-600">Back to dashboard</Link>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something like: 'Top 5 vendors by spend in the last 12 months'"
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" disabled={loading}>
          {loading ? "Working..." : "Ask"}
        </button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500">Generated SQL</div>
            <pre className="text-sm whitespace-pre-wrap">{result.sql}</pre>
          </div>

          {result.data && result.data.length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <div className="mb-2 font-medium">Results</div>
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      {Object.keys(result.data[0]).map((k) => (
                        <th key={k} className="px-2 py-1 text-left">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((v: any, j: number) => (
                          <td key={j} className="px-2 py-1">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && result.data && result.data.length > 0 && typeof Object.values(result.data[0])[1] === "number" && (
            <div className="bg-white p-4 rounded-lg">
              <div className="mb-2 font-medium">Quick visualization</div>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.data}>
                    <XAxis dataKey={Object.keys(result.data[0])[0]} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={Object.keys(result.data[0])[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
