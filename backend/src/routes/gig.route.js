import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/uploadImage.js"
import { clientOnly, freelancerOnly } from "../middleware/role.middleware.js";
import { createGig, getGigById, getGigs, updateGig, deleteGig, inviteFreelancer, uninviteFreelancer, getFreelancerInvitations } from "../controller/gig.controller.js";

const router = Router();


router.get('/', getGigs);
router.get('/:gigId', getGigById);

// Business Operations restricted strictly to verified Clients
router.post('/', authMiddleware, clientOnly, upload.array("files", 5), createGig);
router.put('/:gigId', authMiddleware, clientOnly, upload.array("files", 5),  updateGig);
router.delete('/:gigId', authMiddleware, clientOnly, deleteGig);

// invite freelancer
router.patch("/:gigId/invite", authMiddleware, clientOnly, inviteFreelancer);
router.delete("/:gigId/invite/:freelancerUserId", authMiddleware, clientOnly, uninviteFreelancer);


router.get("/freelancer/invitations", authMiddleware, freelancerOnly, getFreelancerInvitations);


export default router;
