import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { clientOnly, freelancerOnly } from "../middleware/role.middleware.js";
import { addAvailabilitySlots, bookFreelancerSlot, cancelBooking, cancelMySlot, getMySchedule } from "../controller/availability.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/slots", freelancerOnly, addAvailabilitySlots);
router.get("/my-schedule", freelancerOnly, getMySchedule);
router.patch("/my-schedule/slots/:slotId/cancel", freelancerOnly, cancelMySlot);

router.post("/:freelancerUserId/slots/:slotId/book", clientOnly, bookFreelancerSlot);
router.patch("/:freelancerUserId/slots/:slotId/cancel", clientOnly, cancelBooking);

export default router;
