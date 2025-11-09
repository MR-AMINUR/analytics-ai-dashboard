// src/routes/vendors.routes.ts
import { Router } from "express";
import { getTopVendors } from "../controllers/vendors.controller";

const router = Router();

router.get("/top10", getTopVendors);

export default router;
