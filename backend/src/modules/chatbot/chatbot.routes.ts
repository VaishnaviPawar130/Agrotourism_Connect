import { Router } from "express";
import { chatWithAssistant } from "./chatbot.controller";

const router = Router();

router.post("/", chatWithAssistant);

export default router;