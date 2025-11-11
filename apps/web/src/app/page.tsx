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



/**figma page tsx */

// "use client";

// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// const trendData = [
//   { month: 'Jan', value: 35, spend: 25000 },
//   { month: 'Feb', value: 45, spend: 32000 },
//   { month: 'Mar', value: 40, spend: 28000 },
//   { month: 'Apr', value: 50, spend: 35000 },
//   { month: 'May', value: 55, spend: 38000 },
//   { month: 'Jun', value: 48, spend: 33000 },
//   { month: 'Jul', value: 42, spend: 30000 },
//   { month: 'Aug', value: 52, spend: 36000 },
//   { month: 'Sep', value: 58, spend: 40000 },
//   { month: 'Oct', value: 47, spend: 8679.25 },
//   { month: 'Nov', value: 38, spend: 27000 },
//   { month: 'Dec', value: 32, spend: 23000 },
// ];

// const vendorData = [
//   { name: 'AcmeCorp', value: 45000 },
//   { name: 'Test Solutions', value: 40000 },
//   { name: 'PrimeVendors', value: 32000 },
//   { name: 'DeltaServices', value: 18000 },
//   { name: 'OmegaLtd', value: 16000 },
//   { name: 'Global Supply', value: 8679.25 },
//   { name: 'TechPro', value: 15000 },
//   { name: 'AlphaGroup', value: 12000 },
//   { name: 'BetaCorp', value: 9000 },
// ];

// const categoryData = [
//   { name: 'Operations', value: 55000, color: '#2B4DED' },
//   { name: 'Marketing', value: 7250, color: '#F79661' },
//   { name: 'Facilities', value: 1000, color: '#FFD1A7' },
// ];

// const cashflowData = [
//   { range: '0 - 7 days', value: 15000 },
//   { range: '8-30 days', value: 24000 },
//   { range: '31-60 days', value: 7000 },
//   { range: '60+ days', value: 38000 },
// ];

// const invoiceData = Array(9).fill(null).map(() => ({
//   vendor: 'Phunix GmbH',
//   date: '19.08.2025',
//   value: '€ 736.78.44,00'
// }));

// export default function DashboardPage() {
//   return (
//     <div className="flex min-h-screen bg-white">
//       {/* Sidebar */}
//       <div className="w-[220px] h-screen flex flex-col bg-white border-r border-[#E4E4E7] sticky top-0">
//         <div className="flex flex-col flex-1">
//           {/* Header */}
//           <div className="flex flex-col gap-2 p-2 border-b border-[#E4E4E7]">
//             <div className="flex items-center gap-2 p-2">
//               <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
//                 <rect width="32" height="32" rx="8" fill="url(#logo_gradient)" />
//                 <defs>
//                   <linearGradient id="logo_gradient" x1="0" y1="0" x2="32" y2="32">
//                     <stop stopColor="#0050AA" />
//                     <stop offset="1" stopColor="#1B1464" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//               <div className="flex-1 flex flex-col gap-0.5">
//                 <div className="text-sm font-semibold text-[#1C1C1C] leading-5">
//                   Flowbit AI
//                 </div>
//                 <div className="text-xs font-normal text-[#64748B] leading-4">
//                   Analytics
//                 </div>
//               </div>
//               <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
//                 <path d="M4.66667 10L8 13.3333L11.3333 10" stroke="#1C1C1C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
//                 <path d="M4.66667 6L8 2.66667L11.3333 6" stroke="#1C1C1C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//           </div>

//           {/* Menu */}
//           <div className="flex flex-col gap-1 p-2">
//             <div className="px-2 mb-1">
//               <div className="text-xs font-medium text-[#1C1C1C] tracking-[1.92px] leading-4">
//                 GENERAL2
//               </div>
//             </div>
//             <div className="flex flex-col gap-1 pt-1">
//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg bg-[#E3E6F0]">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M16.7 5.68333L11.9 2.325C10.5917 1.40833 8.58333 1.45833 7.325 2.43333L3.15 5.69167C2.31667 6.34167 1.65833 7.675 1.65833 8.725V14.475C1.65833 16.6 3.38333 18.3333 5.50833 18.3333H14.4917C16.6167 18.3333 18.3417 16.6083 18.3417 14.4833V8.83333C18.3417 7.70833 17.6167 6.325 16.7 5.68333ZM11.625 16H8.375V12H11.625V16Z" fill="#1B1464"/>
//                 </svg>
//                 <span className="flex-1 text-base font-semibold text-[#1B1464] leading-6">Dashboard</span>
//               </div>
              
//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg text-[#64748B] hover:bg-gray-50">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M3.05834 2.08333V12.0583C3.05834 12.875 3.44168 13.65 4.10001 14.1417L8.44167 17.3917C9.36667 18.0833 10.6417 18.0833 11.5667 17.3917L15.9083 14.1417C16.5667 13.65 16.95 12.875 16.95 12.0583V2.08333H3.05834Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"/>
//                   <path d="M1.66667 2.08333H18.3333" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
//                   <path d="M6.66667 6.66667H13.3333" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
//                   <path d="M6.66667 10.8333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
//                 </svg>
//                 <span className="flex-1 text-base font-medium leading-6">Invoice</span>
//               </div>

//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg text-[#64748B] hover:bg-gray-50">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M14.1667 11.1667V13.6667C14.1667 17 12.8333 18.3333 9.5 18.3333H6.33333C3 18.3333 1.66667 17 1.66667 13.6667V10.5C1.66667 7.16666 3 5.83333 6.33333 5.83333H8.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M14.1667 11.1667H11.5C9.5 11.1667 8.83333 10.5 8.83333 8.5V5.83333L14.1667 11.1667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span className="flex-1 text-base font-medium leading-6">Other files</span>
//               </div>

//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg text-[#64748B] hover:bg-gray-50">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M16.6667 11.9042L17.9167 12.6083L10.8333 18.1167C10.58 18.2629 10.2926 18.34 10 18.34C9.70744 18.34 9.42003 18.2629 9.16667 18.1167L2.08333 14.0583L3.33333 11.9042M10.8333 11.45L17.9167 7.39166L10.8333 1.88333C10.58 1.73704 10.2926 1.66003 10 1.66003C9.70744 1.66003 9.42003 1.73704 9.16667 1.88333L2.08333 5.94166L9.16667 11.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span className="flex-1 text-base font-medium leading-6">Departments</span>
//               </div>

//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg text-[#64748B] hover:bg-gray-50">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M15.1167 18.0167C14.3833 18.2333 13.5167 18.3333 12.5 18.3333H7.5C6.48333 18.3333 5.61667 18.2333 4.88333 18.0167C5.06667 15.85 7.29167 14.1416 10 14.1416C12.7083 14.1416 14.9333 15.85 15.1167 18.0167Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M12.5 1.66666H7.5C3.33333 1.66666 1.66667 3.33332 1.66667 7.49999V12.5C1.66667 15.65 2.61667 17.375 4.88333 18.0167C5.06667 15.85 7.29167 14.1416 10 14.1416C12.7083 14.1416 14.9333 15.85 15.1167 18.0167C17.3833 17.375 18.3333 15.65 18.3333 12.5V7.49999C18.3333 3.33332 16.6667 1.66666 12.5 1.66666ZM10 11.8083C8.35 11.8083 7.01666 10.4667 7.01666 8.81667C7.01666 7.16667 8.35 5.83332 10 5.83332C11.65 5.83332 12.9833 7.16667 12.9833 8.81667C12.9833 10.4667 11.65 11.8083 10 11.8083Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span className="flex-1 text-base font-medium leading-6">Users</span>
//               </div>

//               <div className="flex items-center gap-3 px-3 py-[6px] h-[52px] rounded-lg text-[#64748B] hover:bg-gray-50">
//                 <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//                   <path d="M2.5 7.59166V12.4C2.5 14.1667 2.5 14.1667 4.16667 15.2917L8.75 17.9417C9.44167 18.3417 10.5667 18.3417 11.25 17.9417L15.8333 15.2917C17.5 14.1667 17.5 14.1667 17.5 12.4083V7.59166C17.5 5.83333 17.5 5.83333 15.8333 4.70833L11.25 2.05833C10.5667 1.65833 9.44167 1.65833 8.75 2.05833L4.16667 4.70833C2.5 5.83333 2.5 5.83333 2.5 7.59166Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span className="flex-1 text-base font-medium leading-6">Settings</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t border-[#E4E4E7] px-4 py-5 flex items-center justify-center">
//           <svg width="128" height="20" viewBox="0 0 128 20" fill="none">
//             <path d="M18.6388 14.2444L11.5954 10.4195C10.2947 9.71312 8.72353 9.71312 7.42283 10.4195L0.379413 14.2444C-0.122477 14.517 -0.127471 15.2339 0.370575 15.5133L7.3698 19.441C8.69811 20.1864 10.3201 20.1864 11.6484 19.441L18.6477 15.5133C19.1457 15.2339 19.1407 14.517 18.6388 14.2444Z" fill="#B0C4FD"/>
//             <path d="M4.02276 7.35259C3.37707 6.85061 3.72251 5.34869 4.54119 5.34869H14.3446C15.1633 5.34869 15.5087 6.85061 14.863 7.35259C13.8926 8.10703 13.1155 9.04407 13.1155 10.1105C13.1155 11.9787 15.5801 13.4499 17.2659 14.2378C17.8411 14.5066 17.8982 15.3623 17.3393 15.6633L11.354 18.8868C10.2759 19.4674 8.97714 19.4674 7.89906 18.8868L1.873 15.6413C1.32042 15.3437 1.36706 14.4997 1.92778 14.2177C3.50352 13.4251 5.77026 11.9629 5.77026 10.1105C5.77026 9.04407 4.9932 8.10703 4.02276 7.35259Z" fill="url(#paint0_linear)"/>
//             <path d="M18.6388 4.35471L11.5954 0.529762C10.2947 -0.176587 8.72353 -0.176587 7.42283 0.529762L0.379413 4.35471C-0.122477 4.62726 -0.127471 5.34416 0.370575 5.62364L7.3698 9.55128C8.69811 10.2967 10.3201 10.2967 11.6484 9.55128L18.6477 5.62364C19.1457 5.34416 19.1407 4.62726 18.6388 4.35471Z" fill="#1B1464"/>
//             <text x="25" y="14" fontFamily="Inter" fontSize="9" fontWeight="600" fill="#1C1C1C" opacity="0.8">FlowbitAI</text>
//             <defs>
//               <linearGradient id="paint0_linear" x1="10.1775" y1="6.81385" x2="10.1494" y2="15.0484" gradientUnits="userSpaceOnUse">
//                 <stop stopColor="#0022CF"/>
//                 <stop offset="1" stopColor="#B0C4FD"/>
//               </linearGradient>
//             </defs>
//           </svg>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Header */}
//         <div className="flex items-center justify-between px-7 py-3 h-16 bg-white border-b border-[#E4E4E7]">
//           <div className="flex items-center gap-2">
//             <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
//               <path d="M7.5 2.5V17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z" stroke="#D2D2D2" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//             <span className="text-sm font-medium text-[#1C1C1C]">Dashboard</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
//               <span className="text-white font-medium text-sm">A</span>
//             </div>
//             <div className="flex flex-col justify-center">
//               <span className="text-sm font-medium text-[#1C1C1C] leading-5">Aminur Mallick</span>
//               <span className="text-xs text-[#64748B] leading-4">Admin</span>
//             </div>
//             <svg className="w-4 h-4 ml-1" viewBox="0 0 16 16" fill="none">
//               <circle cx="8" cy="8" r="0.667" fill="#1C1C1C"/>
//               <circle cx="8" cy="3.333" r="0.667" fill="#1C1C1C"/>
//               <circle cx="8" cy="12.667" r="0.667" fill="#1C1C1C"/>
//             </svg>
//           </div>
//         </div>

//         {/* Dashboard Content */}
//         <div className="flex flex-col gap-4 p-7 bg-white">
//           {/* Stats Cards */}
//           <div className="flex items-center gap-4">
//             <StatCard 
//               title="Total Spend" 
//               subtitle="(YTD)"
//               value="€ 12.679,25" 
//               change="+8.2%" 
//               changeLabel="from last month"
//               positive 
//             />
//             <StatCard 
//               title="Total Invoices Processed" 
//               value="64" 
//               change="+8.2%" 
//               changeLabel="from last month"
//               positive 
//             />
//             <StatCard 
//               title="Documents Uploaded" 
//               subtitle="This Month"
//               value="17" 
//               change="-8" 
//               changeLabel="less from last month"
//               positive={false} 
//             />
//             <StatCard 
//               title="Average Invoice Value" 
//               value="€ 2.455,00" 
//               change="+8.2%" 
//               changeLabel="from last month"
//               positive 
//             />
//           </div>

//           {/* Charts Row 1 */}
//           <div className="flex items-center gap-4">
//             <div className="flex-1 border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-[18px]">
//               <div className="flex flex-col gap-1">
//                 <div className="text-base font-semibold text-[#1C1C1C]">Invoice Volume + Value Trend</div>
//                 <div className="text-xs font-medium text-[#64748B]">Invoice count and total spend over 12 months.</div>
//               </div>
//               <div className="h-[300px] relative">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={trendData}>
//                     <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} />
//                     <YAxis tick={{ fontSize: 10, fill: '#666' }} />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: '#FFF', 
//                         border: '1px solid #E4E4E9', 
//                         borderRadius: '12px',
//                         padding: '12px 16px',
//                         boxShadow: '0 12px 34px -10px rgba(58, 77, 233, 0.15)'
//                       }}
//                       labelStyle={{ color: '#1C1C1C', fontSize: '14px', fontWeight: 600, opacity: 0.7 }}
//                       itemStyle={{ color: '#314CFF', fontSize: '12px', fontWeight: 600 }}
//                     />
//                     <Line type="monotone" dataKey="value" stroke="#1B1464" strokeWidth={3} dot={false} />
//                     <Line type="monotone" dataKey="spend" stroke="rgba(27, 20, 100, 0.26)" strokeWidth={3} dot={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="flex-1 border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-[18px]">
//               <div className="flex flex-col gap-1">
//                 <div className="text-base font-semibold text-[#1C1C1C]">Spend by Vendor (Top 10)</div>
//                 <div className="text-xs font-medium text-[#64748B] w-[315px]">Vendor spend with cumulative percentage distribution.</div>
//               </div>
//               <div className="h-[280px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={vendorData} layout="horizontal" margin={{ left: 0 }}>
//                     <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} />
//                     <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#666' }} />
//                     <Tooltip 
//                       contentStyle={{ 
//                         backgroundColor: '#FFF', 
//                         border: '1px solid #E4E4E9', 
//                         borderRadius: '12px',
//                         padding: '12px 16px'
//                       }}
//                     />
//                     <Bar dataKey="value" fill="#BDBCD6" radius={4} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           {/* Charts Row 2 */}
//           <div className="flex items-start gap-4">
//             <div className="w-[335px] border border-[#E4E4E7] rounded-lg p-4 pb-6 flex flex-col gap-4">
//               <div className="flex flex-col gap-1">
//                 <div className="text-base font-semibold text-[#1C1C1C]">Spend by Category</div>
//                 <div className="text-xs font-medium text-[#64748B] w-[315px]">Distribution of spending across different categories.</div>
//               </div>
//               <div className="h-[315px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={categoryData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       dataKey="value"
//                       startAngle={90}
//                       endAngle={-270}
//                     >
//                       {categoryData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="flex flex-col gap-2.5 px-5">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full bg-[#2B4DED]" />
//                     <span className="text-sm font-medium text-black opacity-50">Operations</span>
//                   </div>
//                   <span className="text-sm font-medium text-black opacity-90">$1,000</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full bg-[#F79661]" />
//                     <span className="text-sm font-medium text-black opacity-50">Marketing</span>
//                   </div>
//                   <span className="text-sm font-medium text-black opacity-90">$7,250</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full bg-[#FFD1A7]" />
//                     <span className="text-sm font-medium text-black opacity-50">Facilities</span>
//                   </div>
//                   <span className="text-sm font-medium text-black opacity-90">$1,000</span>
//                 </div>
//               </div>
//             </div>

//             <div className="w-[335px] border border-[#E4E4E7] rounded-lg p-4 pb-6 flex flex-col gap-7">
//               <div className="flex flex-col gap-1">
//                 <div className="text-base font-semibold text-[#1C1C1C]">Cash Outflow Forecast</div>
//                 <div className="text-xs font-medium text-[#64748B] w-[315px]">Expected payment obligations grouped by due date ranges.</div>
//               </div>
//               <div className="h-[290px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={cashflowData}>
//                     <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#666' }} />
//                     <YAxis tick={{ fontSize: 10, fill: '#666' }} />
//                     <Tooltip />
//                     <Bar dataKey="value" fill="#1B1464" radius={10} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="flex-1 border border-[#E4E4E7] rounded-lg flex flex-col">
//               <div className="p-4 pb-6">
//                 <div className="flex flex-col gap-1">
//                   <div className="text-base font-semibold text-[#1C1C1C]">Invoices by Vendor</div>
//                   <div className="text-xs font-medium text-[#64748B] w-[315px]">Top vendors by invoice count and net value.</div>
//                 </div>
//               </div>
//               <div className="flex flex-col">
//                 <div className="flex items-center h-8 bg-[#F6F6F7] border-b border-[#E4E4E7]">
//                   <div className="flex items-center px-3 w-[155px]">
//                     <span className="text-xs font-medium text-[#1C1C1C]">Vendor</span>
//                   </div>
//                   <div className="flex items-center px-3 flex-1">
//                     <span className="text-xs font-medium text-[#1C1C1C]"># Invoices</span>
//                   </div>
//                   <div className="flex items-center justify-end px-3 w-[127px]">
//                     <span className="text-xs font-medium text-[#1C1C1C]">Net Value</span>
//                   </div>
//                 </div>
//                 {invoiceData.map((row, i) => (
//                   <div key={i} className="flex items-center h-11 bg-white border-b border-[#E4E4E7]">
//                     <div className="flex items-center px-3 w-[125px]">
//                       <span className="text-xs text-[#1C1C1C]">{row.vendor}</span>
//                     </div>
//                     <div className="flex items-center px-3 flex-1">
//                       <span className="text-sm text-[#1C1C1C]">{row.date}</span>
//                     </div>
//                     <div className="flex items-center justify-end px-3 w-[148px]">
//                       <div className="px-2 py-1 rounded-lg border border-[#E4E4E7]">
//                         <span className="text-sm text-[#1C1C1C]">{row.value}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ 
//   title, 
//   subtitle, 
//   value, 
//   change, 
//   changeLabel, 
//   positive 
// }: { 
//   title: string; 
//   subtitle?: string;
//   value: string; 
//   change: string; 
//   changeLabel: string;
//   positive: boolean; 
// }) {
//   return (
//     <div className="w-[279px] border border-[#E4E4E7] rounded-lg p-4 flex flex-col gap-2.5">
//       <div className="flex flex-col gap-7">
//         <div className="flex items-start justify-between">
//           <span className="text-xs font-medium text-black">{title}</span>
//           {subtitle && <span className="text-xs font-medium text-[#64748B]">{subtitle}</span>}
//         </div>
//         <div className="flex items-center justify-between">
//           <div className="flex flex-col gap-1">
//             <span className="text-xl font-semibold text-black leading-6">{value}</span>
//             <div className="flex items-center gap-1">
//               <span className={`text-xs font-semibold ${positive ? 'text-[#2F9F02]' : 'text-[#ED1C24]'}`}>
//                 {change}
//               </span>
//               <span className="text-xs font-medium text-[#8598B3]">{changeLabel}</span>
//             </div>
//           </div>
//           {/* Mini chart placeholder */}
//           <svg width="46" height="26" viewBox="0 0 46 26" fill="none" className="flex-shrink-0">
//             <path d="M0.75 21.8348L10.595 11.8229C11.8791 10.5171 13.7742 10.0177 15.535 10.5213L19.1584 11.5576C20.3933 11.9108 21.7159 11.4387 22.4481 10.3835L26.7846 4.13361C27.8645 2.57715 30.099 2.39895 31.412 3.76456L36.7073 9.27207C37.3997 9.99218 38.5875 9.85534 39.098 8.99667L41.7401 4.55257C42.5427 3.20268 43.8945 2.27035 45.4414 1.99979" 
//               stroke={positive ? "#3AB37E" : "#ED1C24"} 
//               strokeWidth="1.5" 
//               strokeLinecap="round"
//             />
//             {positive && <circle cx="42.25" cy="2.75" r="2" fill="white" stroke="#43B077" strokeWidth="1.5"/>}
//             {!positive && <circle cx="38.88" cy="17.19" r="2" fill="white" stroke="#ED1C24" strokeWidth="1.5"/>}
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }
