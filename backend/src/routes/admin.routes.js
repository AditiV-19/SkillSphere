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
//   getAllPayments,
  getFraudFlags,
  getAnalytics,
} from "../controller/admin.controller.js";

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
// router.get("/payments", getAllPayments);
router.get("/payments/fraud-flags", getFraudFlags);

// Analytics
router.get("/analytics", getAnalytics);

export default router