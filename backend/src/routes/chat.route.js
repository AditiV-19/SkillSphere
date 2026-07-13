import express from "express";

import {
  startConversation,
  getConversations,
  getMessages,
} from "../controller/chat.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startConversation);

router.get("/conversations", authMiddleware, getConversations);

router.get("/messages/:conversationId", authMiddleware, getMessages);

export default router;