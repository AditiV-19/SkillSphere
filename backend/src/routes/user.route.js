import { Router } from 'express';
import { forgotPassword, googleLogin, loginUser, logoutUser, registerUser, resetPassword, verifyEmail } from '../controller/user.controller.js';
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

router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

export default router;