
import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // --- Vanna AI or Groq API call ---
    // For now, we’ll mock a response.
    // Later, we’ll connect this to the real AI endpoint.
    const aiResponse = `Pretend AI says: "${query}" (I'll connect to Vanna AI later).`;

    // Example: If you have Groq API, uncomment below
    /*
    const response = await fetch("https://api.groq.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b",
        messages: [{ role: "user", content: query }],
      }),
    });
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "No response.";
    */

    res.json({ reply: aiResponse });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

export default router;



/*
import { Router } from "express";

const router = Router();

// Temporary mock AI response
router.post("/", (req, res) => {
  const { query } = req.body;

  // Simple rule-based response mock
  let answer = "";
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  if (query.toLowerCase().includes("total spend")) {
    answer = "The total spend is $9,700 based on the current dataset.";
  } else if (query.toLowerCase().includes("average invoice")) {
    answer = "The average invoice value is approximately $2,425.";
  } else {
    answer = `Pretend AI says: "${query}" (I'll connect to Vanna AI later.)`;
  }

  res.json({ answer });
});

export default router;
*/