import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  // for now, respond mock
  res.json({
    sql: "SELECT * FROM invoices LIMIT 5;",
    result: [
      { vendor: "Acme Corp", total: 2500 },
      { vendor: "Globex Ltd", total: 4200 },
    ],
    message: `Mock response for query: "${query}"`,
  });
});

export default router;
