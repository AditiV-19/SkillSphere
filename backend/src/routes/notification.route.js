import express from "express";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controller/notification.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);

router.get("/unread-count", authMiddleware, getUnreadCount);

router.put("/:id/read", authMiddleware, markAsRead);

router.put("/read-all", authMiddleware, markAllAsRead);

router.delete("/:id", authMiddleware, deleteNotification);

export default router;