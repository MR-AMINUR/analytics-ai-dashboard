// src/controllers/vendors.controller.ts
import { Request, Response } from "express";
import { fetchTopVendors } from "../services/vendors.service";

export const getTopVendors = async (req: Request, res: Response) => {
  try {
    const top = Number(req.query.limit ?? 10);
    const data = await fetchTopVendors(top);
    res.json(data);
  } catch (err) {
    console.error("getTopVendors error:", err);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
};
