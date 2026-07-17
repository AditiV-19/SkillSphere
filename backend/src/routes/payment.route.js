import express from 'express'

import {authMiddleware} from "../middleware/auth.middleware.js"
import {
  createOrder,
  verifyPayment,
  releaseMilestone,
  refundPayment,
  getMyTransactions,
  getGigPayments,
} from "../controller/payment.controller.js"


const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyPayment);
router.patch("/:paymentId/release", authMiddleware, releaseMilestone);
router.patch("/:paymentId/refund", authMiddleware, refundPayment);
router.get("/my-transactions", authMiddleware, getMyTransactions);
router.get("/gig/:gigId", authMiddleware, getGigPayments);

export default router;