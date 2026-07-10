import { Router } from "express";
import { createReview, getUserReviews, getGigReviewStatus } from "../controller/review.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; 

const router = Router();

router.post("/", authMiddleware, createReview);
router.get("/user/:userId", authMiddleware, getUserReviews);

router.get("/review/:gigId", authMiddleware, getGigReviewStatus);
export default router;