"use client";
import { useState } from "react";
import { chatWithData } from "@/lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ChatWithDataPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return setError("Please enter a question");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await chatWithData(q.trim());
      // res expected { sql: string, data: [ {..}, ... ] }
      setResult(res);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Chat with Data</h1>
      <form onSubmit={submit} className="flex gap-2 mt-4">
        <input className="flex-1 border px-3 py-2 rounded" value={q} onChange={e=>setQ(e.target.value)} placeholder="Top 5 vendors by spend in the last 12 months" />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>{loading? "Working..." : "Ask"}</button>
      </form>

      {error && <div className="text-red-600 mt-3">{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-500">Generated SQL</div>
            <pre className="text-sm">{result.sql}</pre>
          </div>

          {Array.isArray(result.data) && result.data.length > 0 && (
            <div className="bg-white p-3 rounded border">
              <div className="text-sm font-medium mb-2">Results</div>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      {Object.keys(result.data[0]).map(k => <th key={k} className="px-2 py-1 text-left">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row:any,i:number) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v:any,j:number) => <td key={j} className="px-2 py-1">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick chart if second column numeric */}
              {typeof Object.values(result.data[0])[1] === "number" && (
                <div style={{ width: "100%", height: 240 }} className="mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.data}>
                      <XAxis dataKey={Object.keys(result.data[0])[0]} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={Object.keys(result.data[0])[1]} fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
