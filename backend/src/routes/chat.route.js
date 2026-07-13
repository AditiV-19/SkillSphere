import express from "express";

import {
  startConversation,
  getConversations,
  getMessages,
  markMessagesAsRead,
} from "../controller/chat.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startConversation);

router.get("/conversations", authMiddleware, getConversations);

router.get("/messages/:conversationId", authMiddleware, getMessages);

router.put("/read/:conversationId", authMiddleware, markMessagesAsRead);

export default router;