import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure proper environment for fetch + env vars

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768", // or "llama3-70b-8192"
        messages: [
          {
            role: "system",
            content:
              "You are an analytics assistant. You help users analyze business metrics and datasets. Always respond clearly and concisely.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq request failed: ${response.status} - ${text}`);
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content ?? "No response received.",
    });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response from Groq." },
      { status: 500 }
    );
  }
}
