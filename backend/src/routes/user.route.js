import { Router } from 'express';
import { loginUser, logoutUser, registerUser } from '../controller/user.controller.js';
import { User } from '../models/user.model.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getCurrentUser } from '../controller/auth.controller.js';



const router = Router();


router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.get("/me", authMiddleware, getCurrentUser);

export default router;