import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { createProfile, getProfile, updateProfile, deleteProfile } from "../controller/clientProfile.controller.js";
import { clientOnly } from "../middleware/role.middleware.js";

const router = Router();
router.post("/", authMiddleware, clientOnly, createProfile);
router.get("/", authMiddleware, clientOnly, getProfile);
router.put("/", authMiddleware, clientOnly, updateProfile);
router.delete("/", authMiddleware, clientOnly, deleteProfile);

export default router;
