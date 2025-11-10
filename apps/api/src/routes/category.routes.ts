// src/routes/category.routes.ts
import { Router } from "express";
import { getCategorySpend } from "../controllers/category.controller";

const router = Router();

router.get("/", getCategorySpend);

export default router;
