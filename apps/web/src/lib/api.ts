// apps/web/src/lib/api.ts
const API_BASE = "/api";

async function request(path: string, opts: RequestInit = {}) {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) }});
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${url} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

// export const fetchStats = () => request("/stats");
// export const fetchInvoiceTrends = () => request("/invoice-trends");
// export const fetchTopVendors = () => request("/vendors/top10");
// export const fetchCategorySpend = () => request("/category-spend");
// export const fetchCashOutflow = () => request("/cash-outflow");
// export const fetchInvoices = (q = "") => request(`/invoices${q ? `?${q}` : ""}`);
export const chatWithData = (question: string) => request("/chat-with-data", { method: "POST", body: JSON.stringify({ question }) });
