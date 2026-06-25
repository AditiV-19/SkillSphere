import { Router } from 'express';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { createProfile, getProfile, updateProfile } from '../controller/profile.controller.js';
import { clientOnly, freelancerOnly } from '../middleware/role.middleware.js';



const router = Router();

router.post("/", authMiddleware, createProfile);
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

router.get("/freelancer-test", authMiddleware, freelancerOnly, (req, res)=> {
    res.json({
        message: 'Welcome Freelancer'
    })
});
router.get("/client-test", authMiddleware, clientOnly, (req, res)=> {
    res.json({
        message: 'Welcome Client'
    })
});
export default router;