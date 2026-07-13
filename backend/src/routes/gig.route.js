import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/uploadImage.js"
import { clientOnly, freelancerOnly } from "../middleware/role.middleware.js";
import { createGig, getGigById, getGigs, updateGig, deleteGig, inviteFreelancer, uninviteFreelancer, getFreelancerInvitations, getGigProgress, updateMilestoneStatus, getFreelancerAssignedGigs, getActiveGigs, addProgressLog, getProgressLogs, updateMilestoneDeadline, searchGigs } from "../controller/gig.controller.js";
import { applyToGig, getCompanyAllApplications, getFreelancerApplications, updateFreelancerProposal, updateProposalStatus } from "../controller/proposal.controller.js";

const router = Router();


// Search Gigs
router.get("/search", authMiddleware, searchGigs);


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
router.get("/applications/all", authMiddleware, clientOnly, getCompanyAllApplications);
router.patch("/proposals/:proposalId/status", authMiddleware, clientOnly, updateProposalStatus);

//Assigned Gigs
router.get("/freelancer/assigned-gigs", authMiddleware, freelancerOnly, getFreelancerAssignedGigs);
router.get("/client/active-gigs", authMiddleware, clientOnly, getActiveGigs);

// Milestone Status
router.get("/:gigId/progress", authMiddleware, getGigProgress);
router.patch("/:gigId/milestones/:milestoneId", authMiddleware, freelancerOnly, updateMilestoneStatus);

router.post("/:gigId/logs", authMiddleware, freelancerOnly, addProgressLog);
router.get("/:gigId/logs", authMiddleware, getProgressLogs);

router.patch("/:gigId/milestones/:milestoneId/deadline", authMiddleware, clientOnly, updateMilestoneDeadline);


export default router;