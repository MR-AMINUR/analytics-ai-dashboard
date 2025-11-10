// "use client";
// import useSWR from "swr";
// import { fetchJson } from "@/lib/fetcher";

// export default function OverviewCards() {
//   const { data, error } = useSWR("/api/stats", () => fetchJson<any>("/api/stats"));
//   if (error) return <div>Error loading stats</div>;
//   if (!data) return <div>Loading...</div>;

//   const cards = [
//     { label: "Total Spend (YTD)", value: `$${data.totalSpendYtd.toLocaleString()}` },
//     { label: "Total Invoices Processed", value: data.totalInvoices },
//     { label: "Documents Uploaded", value: data.documentsUploaded },
//     { label: "Average Invoice Value", value: `$${data.averageInvoiceValue.toLocaleString()}` },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//       {cards.map((c, i) => (
//         <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
//           <div className="text-sm text-gray-500">{c.label}</div>
//           <div className="text-2xl font-semibold mt-1">{c.value}</div>
//         </div>
//       ))}
//     </div>
//   );
// }
"use client";
import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export default function OverviewCards() {
  const { data, error } = useSWR("/api/stats", () => fetchJson<any>("/api/stats"));

  if (error) return <div className="text-red-500">Error loading stats: {error.message}</div>;
  if (!data) return <div>Loading...</div>;
  if (!data.totalSpendYtd) return <div>No stats available.</div>;

  const safeNumber = (n: any) =>
    typeof n === "number" ? n.toLocaleString() : "0";

  const cards = [
    { label: "Total Spend (YTD)", value: `$${safeNumber(data.totalSpendYtd)}` },
    { label: "Total Invoices Processed", value: data.totalInvoices ?? 0 },
    { label: "Documents Uploaded", value: data.documentsUploaded ?? 0 },
    { label: "Average Invoice Value", value: `$${safeNumber(data.averageInvoiceValue)}` },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">{c.label}</div>
          <div className="text-2xl font-semibold mt-1">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
