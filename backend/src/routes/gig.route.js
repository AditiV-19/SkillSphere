import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/uploadImage.js"
import { clientOnly, freelancerOnly } from "../middleware/role.middleware.js";
import { createGig, getGigById, getGigs, updateGig, deleteGig, inviteFreelancer, uninviteFreelancer, getFreelancerInvitations } from "../controller/gig.controller.js";
import { applyToGig, getFreelancerApplications, updateFreelancerProposal } from "../controller/proposal.controller.js";

const router = Router();


router.get('/', authMiddleware, getGigs);
router.get('/:gigId', authMiddleware, getGigById);
router.post('/', authMiddleware, clientOnly, upload.array("files", 5), createGig);
router.put('/:gigId', authMiddleware, clientOnly, upload.array("files", 5),  updateGig);
router.delete('/:gigId', authMiddleware, clientOnly, deleteGig);

// invite freelancer
router.patch("/:gigId/invite", authMiddleware, clientOnly, inviteFreelancer);
router.delete("/:gigId/invite/:freelancerUserId", authMiddleware, clientOnly, uninviteFreelancer);

// Invitations on Frelancer side
router.get("/freelancer/invitations", authMiddleware, freelancerOnly, getFreelancerInvitations);

// Proposals
router.post("/:gigId/apply", authMiddleware, freelancerOnly, applyToGig);
router.put("/proposals/:proposalId", authMiddleware, freelancerOnly, updateFreelancerProposal);
router.get("/freelancer/applications/all", authMiddleware, freelancerOnly, getFreelancerApplications);
export default router;
