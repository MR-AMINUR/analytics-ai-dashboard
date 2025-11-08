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
