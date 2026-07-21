import express from "express";

import {authMiddleware} from "../middleware/auth.middleware.js";
import {adminOnly} from "../middleware/role.middleware.js";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  verifyFreelancer,
  getPendingGigs,
  approveGig,
  rejectGig,
  getFraudFlags,
  getAnalytics,
  getAllPayments,
} from "../controller/admin.controller.js";
import { getFreelancerById } from "../controller/freelancerProfile.controller.js";
import { getClientById } from "../controller/clientProfile.controller.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);
router.patch("/users/:id/verify", verifyFreelancer);

// Gigs
router.get("/gigs/pending", getPendingGigs);
router.patch("/gigs/:id/approve", approveGig);
router.patch("/gigs/:id/reject", rejectGig);

// Payments
router.get("/payments", getAllPayments);
router.get("/payments/fraud-flags", getFraudFlags);

// Analytics
router.get("/analytics", getAnalytics);

//  Investigating fraud
router.get("/freelancer/:id", authMiddleware, adminOnly, getFreelancerById);
router.get("/client/:id", authMiddleware, adminOnly, getClientById);

export default router