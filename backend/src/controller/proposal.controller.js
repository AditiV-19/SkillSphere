import { Proposal } from "../models/proposal.model.js";
import { Gig } from "../models/gig.model.js";

export const applyToGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { description, bidAmount, estimatedTime } = req.body;

    // 1. Verify that the target project exists and is still accepting applications
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.status !== "open") {
      return res.status(400).json({ message: "This gig is no longer accepting proposals." });
    }

    // 2. Create the proposal record linked to the logged-in freelancer's req.user.id
    const newProposal = await Proposal.create({
      gig: gigId,
      freelancerUser: req.user.id,
      description,
      bidAmount,
      estimatedTime
    });

    // TODO Week 3: Fire real-time notification to the Client via Socket.IO/Email

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully!",
      proposal: newProposal
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this gig." });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};