
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    console.log("🔹 Received query:", query);

    // 🔹 Send query to your Vanna Flask backend
    const response = await fetch("http://127.0.0.1:5000/api/v0/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: query }),
    });

    const data = await response.json();

    console.log("🔹 Vanna response:", data);

    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json({
      sql: data.sql,
      answer: data.answer,
    });
  } catch (error) {
    console.error("Vanna API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response from Vanna backend." },
      { status: 500 }
    );
  }
}



// import { NextResponse } from "next/server";

// export const runtime = "nodejs"; // ensure proper environment for fetch + env vars

// export async function POST(req: Request) {
//   try {
//     const { query } = await req.json();

//     // 🔹 ADD THIS: for debugging
//     console.log("🔹 Received query:", query);
//     console.log("🔹 GROQ_API_KEY exists?", !!process.env.GROQ_API_KEY);

//     const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "mixtral-8x7b-32768", // or "llama3-70b-8192"
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are an analytics assistant. You help users analyze business metrics and datasets. Always respond clearly and concisely.",
//           },
//           {
//             role: "user",
//             content: query,
//           },
//         ],
//         temperature: 0.2,
//         max_tokens: 500,
//       }),
//     });

//     // 🔹 ADD THIS: show response info
//     console.log("🔹 Groq status:", response.status);

//     const text = await response.text();
//     console.log("🔹 Groq raw response:", text);


//     if (!response.ok) {
//       const text = await response.text();
//       throw new Error(`Groq request failed: ${response.status} - ${text}`);
//     }

//     const data = await response.json();

//     return NextResponse.json({
//       reply: data.choices?.[0]?.message?.content ?? "No response received.",
//     });
//   } catch (error) {
//     console.error("Groq API error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch response from Groq." },
//       { status: 500 }
//     );
//   }
// }
