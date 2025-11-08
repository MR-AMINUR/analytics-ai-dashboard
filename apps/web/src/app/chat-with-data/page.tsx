"use client";

import { useEffect, useState } from "react";

export default function ChatWithDataPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:5000/api/chat-with-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      setResponse("Error: failed to connect to AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">💬 Chat with Your Data</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something like 'What’s the total spend?'"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {response && (
        <div className="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}























// "use client";

// import { useState } from "react";

// export default function ChatWithDataPage() {
//   const [query, setQuery] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setAnswer("");

//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/chat-with-data",
//         //`${process.env.NEXT_PUBLIC_API_URL}/api/chat-with-data`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ query }),
//         }
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to get AI response");
//       setAnswer(data.answer);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">💬 Chat with Your Data</h1>

//       <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Ask something like 'What’s the total spend?'"
//           className="flex-1 border rounded-lg px-3 py-2"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white rounded-lg px-4 py-2"
//         >
//           {loading ? "Thinking..." : "Ask"}
//         </button>
//       </form>

//       {error && <p className="text-red-600">{error}</p>}
//       {answer && (
//         <div className="bg-white shadow rounded-lg p-4 mt-4">
//           <p className="text-gray-700">{answer}</p>
//         </div>
//       )}
//     </div>
//   );
// }
