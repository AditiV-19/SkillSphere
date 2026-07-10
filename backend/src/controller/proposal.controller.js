import { Proposal } from "../models/proposal.model.js";
import { Gig } from "../models/gig.model.js";
import { ClientProfile } from "../models/profile.model.js";

export const applyToGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { description, bidAmount, estimatedTime } = req.body;

    // 1. Verify that the target project exists and is still accepting applications
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.status !== "open") {
      return res
        .status(400)
        .json({ message: "This gig is no longer accepting proposals." });
    }

    // 2. Create the proposal record linked to the logged-in freelancer's req.user.id
    const newProposal = await Proposal.create({
      gig: gigId,
      freelancerUser: req.user.id,
      description,
      bidAmount,
      estimatedTime,
    });

    // TODO Week 3: Fire real-time notification to the Client via Socket.IO/Email

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully!",
      proposal: newProposal,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already applied to this gig." });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getFreelancerApplications = async (req, res) => {
  try {
    // Look up all proposals matching the authenticated freelancer's user ID
    const applications = await Proposal.find({ freelancerUser: req.user.id })
      .populate({
        path: "gig",
        select: "title description budget status", // Grab core project info to render on cards
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateFreelancerProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { description, bidAmount, estimatedTime } = req.body;

    // 1. Find the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found." });

    // 2. Security Check: Ensure this proposal belongs to the logged-in freelancer
    if (proposal.freelancerUser.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this proposal." });
    }

    // 3. Status Guard: Only allow updates if the client hasn't acted on it yet
    if (proposal.status !== "pending") {
      return res.status(400).json({
        message: `Cannot modify a proposal that has already been ${proposal.status}.`,
      });
    }

    // 4. Perform Update
    proposal.description = description || proposal.description;
    proposal.bidAmount = bidAmount || proposal.bidAmount;
    proposal.estimatedTime = estimatedTime || proposal.estimatedTime;

    await proposal.save();

    return res.json({
      success: true,
      message: "Proposal updated successfully!",
      proposal,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status } = req.body; // "accepted", "negotiating", "rejected"

    if (!["pending", "accepted", "negotiating", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status parameter." });
    }

    // 1. Update the target proposal status document
    const proposal = await Proposal.findByIdAndUpdate(
      proposalId,
      { status },
      { returnDocument: "after" },
    );

    if (!proposal) {
      return res.status(404).json({ message: "Proposal record not found." });
    }

    // 🚀 THE CRITICAL ADDITION: Sync parent Gig parameters automatically on acceptance
    if (status === "accepted") {
      await Gig.findByIdAndUpdate(
        proposal.gig, // Maps to the parent Gig ObjectID attached to this proposal
        {
          assignedFreelancer: proposal.freelancerUser, // Assign the freelancer's User ID
          status: "in_progress", // Advance status to trigger client matching
        },
        { returnDocument: "after" },
      );
    }

    return res.json({
      success: true,
      message: `Proposal status updated to ${status}`,
      proposal,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getCompanyAllApplications = async (req, res) => {
  try {
    const clientProfile = await ClientProfile.findOne({ user: req.user.id });

    if (!clientProfile) {
      return res.status(404).json({
        success: false,
        message:
          "Client profile profile registry index not found for this user account.",
      });
    }

    const gigs = await Gig.find({ client: clientProfile._id }).sort({
      createdAt: -1,
    });

    const gigsWithApplications = await Promise.all(
      gigs.map(async (gig) => {
        const proposals = await Proposal.find({ gig: gig._id })
          .populate("freelancerUser", "firstName lastName email")
          .sort({ createdAt: -1 });

        return {
          ...gig.toObject(),
          proposals,
          proposalsCount: proposals.length,
        };
      }),
    );

    return res.json({
      success: true,
      data: gigsWithApplications,
    });
  } catch (error) {
    console.error("Dashboard database breakdown:", error);
    return res.status(500).json({
      message: "Server error packaging company data deck",
      error: error.message,
    });
  }
};
