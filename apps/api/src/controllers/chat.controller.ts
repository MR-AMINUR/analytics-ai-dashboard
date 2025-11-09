// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import { forwardToVanna } from "../services/chat.service";

export const chatWithData = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "question is required" });

    const result = await forwardToVanna(question);
    res.json(result);
  } catch (err) {
    console.error("chatWithData error:", err);
    res.status(500).json({ error: "Failed to process chat query" });
  }
};
