import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/uploadImage.js"
import { clientOnly } from "../middleware/role.middleware.js";
import { createGig, getGigById, getGigs, updateGig, deleteGig } from "../controller/gig.controller.js";

const router = Router();


router.get('/', getGigs);
router.get('/:id', getGigById);

// Business Operations restricted strictly to verified Clients
router.post('/', authMiddleware, clientOnly, upload.array("files", 5), createGig);
router.put('/:id', authMiddleware, clientOnly, upload.array("files", 5),  updateGig);
router.delete('/:id', authMiddleware, clientOnly, deleteGig);

export default router;
