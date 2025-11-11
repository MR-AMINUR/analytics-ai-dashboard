"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// === Fallback mock data ===
const mockTrendData = [
  { month: "Jan", value: 35, spend: 25000 },
  { month: "Feb", value: 45, spend: 32000 },
  { month: "Mar", value: 40, spend: 28000 },
  { month: "Apr", value: 50, spend: 35000 },
  { month: "May", value: 55, spend: 38000 },
  { month: "Jun", value: 48, spend: 33000 },
  { month: "Jul", value: 42, spend: 30000 },
  { month: "Aug", value: 52, spend: 36000 },
  { month: "Sep", value: 58, spend: 40000 },
  { month: "Oct", value: 47, spend: 8679.25 },
  { month: "Nov", value: 38, spend: 27000 },
  { month: "Dec", value: 32, spend: 23000 },
];

const mockVendorData = [
  { vendor_name: "AcmeCorp", spend: 45000 },
  { vendor_name: "Test Solutions", spend: 40000 },
  { vendor_name: "PrimeVendors", spend: 32000 },
  { vendor_name: "DeltaServices", spend: 18000 },
  { vendor_name: "OmegaLtd", spend: 16000 },
  { vendor_name: "Global Supply", spend: 8679.25 },
  { vendor_name: "TechPro", spend: 15000 },
  { vendor_name: "AlphaGroup", spend: 12000 },
  { vendor_name: "BetaCorp", spend: 9000 },
];

const mockCategoryData = [
  { category: "Operations", spend: 55000, color: "#2B4DED" },
  { category: "Marketing", spend: 7250, color: "#F79661" },
  { category: "Facilities", spend: 1000, color: "#FFD1A7" },
];

const mockCashflowData = [
  { range: "0 - 7 days", amount: 15000 },
  { range: "8-30 days", amount: 24000 },
  { range: "31-60 days", amount: 7000 },
  { range: "60+ days", amount: 38000 },
];

const mockInvoiceData = Array(9)
  .fill(null)
  .map(() => ({
    vendor_name: "Phunix GmbH",
    invoice_date: "19.08.2025",
    invoice_total: 73678.44,
  }));

export default function DashboardPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>(mockTrendData);
  const [vendorData, setVendorData] = useState<any[]>(mockVendorData);
  const [categoryData, setCategoryData] = useState<any[]>(mockCategoryData);
  const [cashflowData, setCashflowData] = useState<any[]>(mockCashflowData);
  const [invoiceData, setInvoiceData] = useState<any[]>(mockInvoiceData);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, trendsRes, vendorsRes, catsRes, cashRes, invByVendorRes] =
          await Promise.all([
            fetch(`${API_BASE}/stats`),
            fetch(`${API_BASE}/invoice-trends`),
            fetch(`${API_BASE}/vendors/top10`),
            fetch(`${API_BASE}/category-spend`),
            fetch(`${API_BASE}/cash-outflow`),
            fetch(`${API_BASE}/invoices/by-vendor`), // ✅ new backend endpoint
          ]);

        if (statsRes.ok) setStats(await statsRes.json());

        const trends = await trendsRes.json();
        if (Array.isArray(trends)) setTrendData(trends);

        const vendors = await vendorsRes.json();
        if (Array.isArray(vendors)) setVendorData(vendors);

        const cats = await catsRes.json();
        if (Array.isArray(cats)) setCategoryData(cats);

        const cash = await cashRes.json();
        if (cash.rows) setCashflowData(cash.rows);

        const invoices = await invByVendorRes.json();
        if (Array.isArray(invoices)) setInvoiceData(invoices); // ✅ save here
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    fetchData();
  }, [API_BASE]);


  const fmt = (n: number) =>
    n?.toLocaleString("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });

  const vendorDataClean = (vendorData ?? []).map((v) => ({
    name: v.vendor_name ?? v.name ?? "Unknown",
    spend: Number(v.spend ?? v.value ?? 0),
  }));

  // Category code-to-name mapping
  type CategoryRange = {
    start: number;
    end: number;
    name: string;
  };

  const CATEGORY_RANGES: CategoryRange[] = [
    { start: 4000, end: 4999, name: "Operations" },
    { start: 5000, end: 5999, name: "Utilities" },
    { start: 6000, end: 6999, name: "Travel" },
    { start: 7000, end: 7999, name: "Marketing" },
    { start: 8000, end: 8999, name: "Software" },
    { start: 9000, end: 9999, name: "Miscellaneous" },
  ];


  const CATEGORY_COLORS = [
    "#2B4DED", // blue
    "#F79661", // orange
    "#FFD1A7", // peach
    "#10B981", // green
    "#6366F1", // indigo
    "#E11D48", // red
    "#0EA5E9", // sky blue
  ];
  function getCategoryName(code: string | number): string {
    const num = Number(code);
    const found = CATEGORY_RANGES.find(
      (r) => num >= r.start && num <= r.end
    );
    return found ? found.name : "Other";
  }

  const categoryDataClean = Object.values(
    (categoryData ?? [])
      .filter((c) => Number(c.spend) > 0) // filter negatives
      .reduce((acc: any, c) => {
        const name = getCategoryName(c.category);
        const value = Number(c.spend ?? 0);
        acc[name] = acc[name]
          ? { ...acc[name], value: acc[name].value + value }
          : { name, value };
        return acc;
      }, {})
  ).map((c: any, i: number) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));



  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex flex-col">
        {/* === Header === */}
        <div className="flex items-center justify-between px-7 py-3 h-16 bg-white border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1C1C1C]">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-[#1C1C1C] leading-5">
                Aminur Mallick
              </span>
              <span className="text-xs text-[#64748B] leading-4">Admin</span>
            </div>
          </div>
        </div>

        {/* === Dashboard Content === */}
        <div className="flex flex-col gap-4 p-7 bg-white">
          {/* === Stats === */}
          <div className="flex items-center gap-4">
            <StatCard
              title="Total Spend"
              subtitle="(YTD)"
              value={fmt(stats?.totalSpendYtd || 12679.25)}
              change="+8.2%"
              changeLabel="from last month"
              positive
            />
            <StatCard
              title="Total Invoices Processed"
              value={stats?.totalInvoices || 64}
              change="+5.4%"
              changeLabel="from last month"
              positive
            />
            <StatCard
              title="Documents Uploaded"
              subtitle="This Month"
              value={stats?.documentsUploaded || 17}
              change="-1.2%"
              changeLabel="less from last month"
              positive={false}
            />
            <StatCard
              title="Average Invoice Value"
              value={fmt(stats?.averageInvoiceValue || 2455)}
              change="+1.2%"
              changeLabel="from last month"
              positive
            />
          </div>

          {/* === Charts Row 1 === */}
          <div className="flex items-center gap-4">
            {/* === Invoice Trend === */}
            <ChartCard
              title="Invoice Volume + Value Trend"
              subtitle="Invoice count and total spend over 12 months."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#666" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={(d) => d.value ?? d.invoiceCount}
                    stroke="#1B1464"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={(d) => d.spend ?? d.totalAmount}
                    stroke="rgba(27, 20, 100, 0.26)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* === Vendor Spend === */}

            {/* === Vendor Spend === */}
            <ChartCard
              title="Spend by Vendor (Top 10)"
              subtitle="Vendor spend with cumulative percentage distribution."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vendorDataClean}
                  layout="vertical" // ✅ important: we want horizontal bars
                  margin={{ top: 10, right: 20, left: 80, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#666" }}
                    domain={[0, "auto"]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#666" }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(val: number) =>
                      [`€${val.toLocaleString()}`, "Spend (€)"]
                    }
                    contentStyle={{
                      backgroundColor: "#FFF",
                      border: "1px solid #E4E4E9",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  />
                  <Bar
                    dataKey="spend"
                    fill="#1B1464"
                    radius={[4, 4, 4, 4]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>


          </div>

          {/* === Charts Row 2 === */}
          <div className="flex items-start gap-4">
            {/* === Category Spend === */}
            {/* === Spend by Category === */}
            {/* === Spend by Category === */}
            <ChartCard
              title="Spend by Category"
              subtitle="Distribution of spending across different categories."
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDataClean}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {categoryDataClean.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, props) =>
                      [`€${Number(val).toLocaleString()}`, props.payload.name]
                    }
                    contentStyle={{
                      backgroundColor: "#FFF",
                      border: "1px solid #E4E4E9",
                      borderRadius: "12px",
                      padding: "12px 16px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-2 mt-4 px-4">
                {categoryDataClean.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-sm font-medium text-[#1C1C1C] opacity-70">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#1C1C1C]">
                      €{c.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* === Cash Outflow Forecast === */}
            <div className="w-[335px] border border-[#E4E4E7] rounded-lg p-4 pb-6 flex flex-col gap-7">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-[#1C1C1C]">Cash Outflow Forecast</div>
                <div className="text-xs font-medium text-[#64748B] w-[315px]">
                  Expected payment obligations grouped by due date ranges.
                </div>
              </div>

              <div className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#666" }} />
                    <YAxis
                      tickFormatter={(v) => `€${v / 1000}k`}
                      tick={{ fontSize: 10, fill: "#666" }}
                    />
                    <Tooltip
                      formatter={(v) => [`€${Number(v).toLocaleString()}`, "Outflow"]}
                      contentStyle={{
                        backgroundColor: "#FFF",
                        border: "1px solid #E4E4E9",
                        borderRadius: "12px",
                        padding: "12px 16px",
                      }}
                      labelStyle={{ color: "#1C1C1C", fontSize: "14px", fontWeight: 600, opacity: 0.7 }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#1B1464"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Optional textual summary below chart */}
              <div className="flex flex-col gap-2 px-2 mt-2">
                {cashflowData?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-[#1C1C1C] opacity-70">
                    <span>{item?.range ?? "N/A"}</span>
                    <span className="font-semibold">€{Number(item?.value ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>

            </div>



            {/* === Invoices === */}
            {/* === Invoices === */}
            <ChartCard
              title="Invoices by Vendor"
              subtitle="Top vendors by latest invoice and total spend."
            >
              <div className="flex flex-col">
                <div className="flex items-center h-8 bg-[#F6F6F7] border-b border-[#E4E4E7]">
                  <div className="w-[125px] px-3 text-xs font-medium text-[#1C1C1C]">
                    Vendor
                  </div>
                  <div className="flex-1 px-3 text-xs font-medium text-[#1C1C1C]">
                    Date
                  </div>
                  <div className="w-[148px] px-3 text-right text-xs font-medium text-[#1C1C1C]">
                    Net Value
                  </div>
                </div>

                {invoiceData.slice(0, 9).map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center h-11 bg-white border-b border-[#E4E4E7]"
                  >
                    {/* Vendor Name */}
                    <div className="w-[125px] px-3 text-xs text-[#1C1C1C]">
                      {row.vendor_name ?? "—"}
                    </div>

                    {/* Invoice Date */}
                    <div className="flex-1 px-3 text-sm text-[#1C1C1C]">
                      {row.latest_invoice_date
                        ? new Date(row.latest_invoice_date).toLocaleDateString("en-GB")
                        : "—"}
                    </div>

                    {/* Net Value */}
                    <div className="w-[148px] px-3 text-right">
                      {fmt(row.total_spend ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

          </div>
        </div>
      </div>
    </div>
  );
}

// === Components ===

function StatCard({ title, subtitle, value, change, changeLabel, positive }: any) {
  return (
    <div className="w-[279px] border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-black">{title}</span>
        {subtitle && <span className="text-xs text-[#64748B]">{subtitle}</span>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-semibold text-black">{value}</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-semibold ${positive ? "text-[#2F9F02]" : "text-[#ED1C24]"
                }`}
            >
              {change}
            </span>
            <span className="text-xs font-medium text-[#8598B3]">
              {changeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="flex-1 border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="text-base font-semibold text-[#1C1C1C]">{title}</div>
        <div className="text-xs font-medium text-[#64748B]">{subtitle}</div>
      </div>
      <div className="h-[300px]">{children}</div>
    </div>
  );
}
