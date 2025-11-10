import dotenv from "dotenv";
dotenv.config();

// ✅ Use Node’s built-in global fetch
const VANNA_API_BASE_URL =
  process.env.VANNA_API_BASE_URL || "http://localhost:8000";

export async function forwardToVanna(question: string) {
  try {
    const res = await fetch(`${VANNA_API_BASE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Vanna API error (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data; // { sql, data }
  } catch (error: any) {
    console.error("chatWithData error:", error);
    throw error;
  }
}
