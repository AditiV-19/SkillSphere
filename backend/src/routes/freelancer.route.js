import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { createProfile, getProfile, updateProfile, deleteProfile, searchFreelancers } from "../controller/freelancerProfile.controller.js";

import { freelancerOnly } from "../middleware/role.middleware.js";

const router = Router();

router.post("/", authMiddleware, freelancerOnly, createProfile);
router.get("/", authMiddleware, freelancerOnly, getProfile);
router.put("/", authMiddleware, freelancerOnly, updateProfile);
router.delete("/", authMiddleware, freelancerOnly, deleteProfile);

router.get("/search", authMiddleware, searchFreelancers);
export default router;
