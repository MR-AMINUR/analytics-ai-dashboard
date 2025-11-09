// src/services/chat.service.ts
// Remove the static import
// Add this helper instead
const fetch = (...args: Parameters<typeof import("node-fetch")["default"]>) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { prisma } from "../prisma/client";

type VannaResponse = {
  sql?: string;
  data?: any;
  error?: string;
};

/**
 * Forwards the natural language question to the Vanna AI service.
 * Vanna should return an object with { sql: string } OR { sql, data } if it executed.
 * If Vanna only returns SQL, this service will execute it on Postgres (careful).
 */
export const forwardToVanna = async (question: string): Promise<VannaResponse> => {
  const base = process.env.VANNA_API_BASE_URL;
  if (!base) throw new Error("VANNA_API_BASE_URL not configured");

  const resp = await fetch(`${base.replace(/\/$/, "")}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.VANNA_API_KEY ? { Authorization: `Bearer ${process.env.VANNA_API_KEY}` } : {}),
    },
    body: JSON.stringify({ question }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Vanna API error: ${resp.status} ${text}`);
  }

  const payload = (await resp.json()) as VannaResponse;

  // If Vanna already executed SQL and returned data, return it
  if (payload.data || payload.sql == null) return payload;

  // If Vanna returned SQL only, execute it cautiously via Prisma.rawQuery
  const sql = payload.sql!;
  // WARNING: Executing arbitrary SQL is dangerous. We assume Vanna produces safe SQL.
  // Use prisma.$queryRawUnsafe only if you trust input; better to parse/validate the SQL first.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any).$queryRawUnsafe(sql);
    return { sql, data: rows };
  } catch (err: any) {
    console.error("SQL execution error:", err);
    return { sql, error: String(err) };
  }
};
