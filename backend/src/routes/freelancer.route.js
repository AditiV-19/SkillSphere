import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { createProfile, getProfile, updateProfile, deleteProfile, searchFreelancers, submitVerificationRequest, getMyVerificationStatus, rejectVerification, getPendingVerifications, approveVerification } from "../controller/freelancerProfile.controller.js";

import { adminOnly, freelancerOnly } from "../middleware/role.middleware.js";

const router = Router();

router.post("/", authMiddleware, freelancerOnly, createProfile);
router.get("/", authMiddleware, freelancerOnly, getProfile);
router.put("/", authMiddleware, freelancerOnly, updateProfile);
router.delete("/", authMiddleware, freelancerOnly, deleteProfile);

router.get("/search", authMiddleware, searchFreelancers);

router.post("/verification/submit", authMiddleware, freelancerOnly, submitVerificationRequest);
router.get("/verification/status", authMiddleware, freelancerOnly, getMyVerificationStatus);

router.get("/verification/pending", authMiddleware, adminOnly, getPendingVerifications);
router.put("/verification/:id/approve", authMiddleware, adminOnly, approveVerification);
router.put("/verification/:id/reject", authMiddleware, adminOnly, rejectVerification);
export default router;
