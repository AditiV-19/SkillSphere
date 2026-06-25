import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { createProfile, getProfile, updateProfile } from '../controller/profile.controller.js';



const router = Router();

router.post("/", authMiddleware, createProfile);
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

export default router;