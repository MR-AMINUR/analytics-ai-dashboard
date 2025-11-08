export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchData(endpoint: string) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    return null;
  }
}

export async function fetchStats() {
  console.log("Fetching from:", `${API_BASE_URL}/api/stats`); // 👈 add this line
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}


export async function fetchVendorsTop10() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${baseUrl}/api/vendors/top10`);
  if (!res.ok) throw new Error("Failed to fetch top vendors");
  return res.json();
}

export async function fetchInvoices() {
  const res = await fetch(`${API_BASE_URL}/api/invoices`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}
