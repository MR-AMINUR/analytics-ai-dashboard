// src/routes/chat.routes.ts
import { Router } from "express";
import { chatWithData } from "../controllers/chat.controller";

const router = Router();

router.post("/", chatWithData);

export default router;
