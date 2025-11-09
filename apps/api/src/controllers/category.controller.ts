// src/controllers/category.controller.ts
import { Request, Response } from "express";
import { fetchCategorySpend } from "../services/category.service";

export const getCategorySpend = async (req: Request, res: Response) => {
  try {
    const top = Number(req.query.limit ?? 10);
    const data = await fetchCategorySpend(top);
    res.json(data);
  } catch (err) {
    console.error("getCategorySpend error:", err);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
};
