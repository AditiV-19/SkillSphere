import { Router } from 'express';
import { googleLogin, loginUser, logoutUser, registerUser, verifyEmail } from '../controller/user.controller.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getCurrentUser } from '../controller/auth.controller.js';
import { sendVerificationEmail } from '../services/email.services.js';



const router = Router();


router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get("/me", authMiddleware, getCurrentUser);
router.post("/google", googleLogin)
router.get("/verify-email/:token", verifyEmail);

export default router;