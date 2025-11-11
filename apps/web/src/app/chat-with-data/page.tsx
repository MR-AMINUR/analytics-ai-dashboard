"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithData } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ChatWithDataPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return setError("Please enter a question");

    setLoading(true);
    setError(null);

    const currentQuery = q.trim();
    setQ("");

    try {
      const res = await chatWithData(currentQuery);
      // res expected { sql: string, data: [ {..}, ... ] }
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          query: currentQuery,
          sql: res?.sql ?? "No SQL generated.",
          data: Array.isArray(res?.data) ? res.data : [],
        },
      ]);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  return (
    <div className="p-6 flex flex-col h-screen">
      <h1 className="text-2xl font-semibold mb-4">Chat with Data</h1>

      <form onSubmit={submit} className="flex gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="e.g., Top 5 vendors by spend in the last 12 months"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Ask"}
        </button>
      </form>

      {error && <div className="text-red-600 mt-3">{error}</div>}

      <div
        ref={chatRef}
        className="mt-6 flex-1 overflow-y-auto space-y-6 bg-gray-50 rounded-lg p-4 border"
      >
        {history.length === 0 && !loading && (
          <div className="text-gray-500 text-center mt-10">
            🤖 Ask a data question to explore insights from your database.
          </div>
        )}

        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-white shadow-sm border rounded-lg p-4 space-y-3"
          >
            {/* User query */}
            <div className="text-gray-900 font-medium">
              Q: {entry.query}
            </div>

            {/* Generated SQL */}
            <div className="bg-gray-100 rounded p-2 text-xs text-gray-700 whitespace-pre-wrap border">
              <div className="font-semibold text-gray-500 mb-1">
                Generated SQL
              </div>
              {entry.sql}
            </div>

            {/* Table + Chart */}
            {entry.data?.length > 0 ? (
              <div className="space-y-3">
                {/* Table */}
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        {Object.keys(entry.data[0]).map((k) => (
                          <th
                            key={k}
                            className="px-2 py-1 text-left font-medium border-b"
                          >
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entry.data.map((row: any, i: number) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          {Object.values(row).map((v: any, j: number) => (
                            <td key={j} className="px-2 py-1">
                              {String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Auto Chart */}
                {typeof Object.values(entry.data[0])[1] === "number" && (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {entry.data.length > 5 ? (
                        <LineChart data={entry.data}>
                          <XAxis dataKey={Object.keys(entry.data[0])[0]} />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey={Object.keys(entry.data[0])[1]}
                            stroke="#4f46e5"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={entry.data}>
                          <XAxis dataKey={Object.keys(entry.data[0])[0]} />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey={Object.keys(entry.data[0])[1]}
                            fill="#4f46e5"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                No data returned for this query.
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 text-sm italic">Thinking...</div>
        )}
      </div>
    </div>
  );
}
