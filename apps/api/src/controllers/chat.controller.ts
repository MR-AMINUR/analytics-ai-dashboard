import { Request, Response } from "express";
import { forwardToVanna } from "../services/chat.service";

export async function chatWithData(req: Request, res: Response) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing 'question' field" });
    }

    // Forward question to Vanna FastAPI
    const data = await forwardToVanna(question);

    // Return the same structured response
    res.json(data); // { sql, data }
  } catch (error: any) {
    console.error("chatWithData error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
