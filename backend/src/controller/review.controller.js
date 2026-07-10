import { Review } from "../models/review.model.js";
import { Gig } from "../models/gig.model.js";
import { User } from "../models/user.model.js";
import { ClientProfile, FreelancerProfile } from "../models/profile.model.js";

export const createReview = async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;
    const reviewerUserId = req.user.id; // the actual acting party — always a User ID

    // 1. Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // 2. Fraud & Verification: gig must exist and be completed
    const gig = await Gig.findById(projectId);
    if (!gig) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (gig.status !== "completed") {
      return res
        .status(400)
        .json({ message: "You can only review completed projects." });
    }

    // 3. Determine which role the requester actually is on THIS gig,
    //    and — critically — who the only valid reviewee is for that role.
    const clientProfile = await ClientProfile.findById(gig.client);
    if (!clientProfile) {
      return res.status(404).json({ message: "Gig owner profile not found" });
    }

    const isClient = clientProfile.user.toString() === reviewerUserId;
    const isFreelancer =
      gig.assignedFreelancer &&
      gig.assignedFreelancer.toString() === reviewerUserId;

    if (!isClient && !isFreelancer) {
      return res
        .status(403)
        .json({ message: "You are not authorized to review this project." });
    }

    // The only legitimate reviewee is "the other party on this specific gig" —
    // not whatever the client sent in the request body.
    const expectedRevieweeId = isClient
      ? gig.assignedFreelancer?.toString()
      : clientProfile.user.toString();

    if (!expectedRevieweeId || revieweeId !== expectedRevieweeId) {
      return res.status(400).json({
        message: "You can only review the other party on this project.",
      });
    }

    if (reviewerUserId === revieweeId) {
      return res
        .status(400)
        .json({ message: "You cannot leave a review for yourself." });
    }

    const calculateWeight = (budget) => {
      if (budget < 5000) return 1;

      if (budget <= 20000) return 2;

      return 3;
    };

    const weight = calculateWeight(gig.budget);

    // 4. Create the review (compound unique index on {project, reviewer} protects against duplicates)
    const review = await Review.create({
      project: projectId,
      reviewer: reviewerUserId,
      reviewee: revieweeId,
      rating,
      weight,
      comment,
    });

    // 5. Recalculate weighted reputation
    const allReviewsForUser = await Review.find({ reviewee: revieweeId });
    const totalRatingSum = allReviewsForUser.reduce(
      (sum, rev) => sum + rev.rating,
      0,
    );
    const averageRating = (totalRatingSum / allReviewsForUser.length).toFixed(
      2,
    );

    let weightedSum = 0;
    let totalWeight = 0;

    allReviewsForUser.forEach((review) => {
      weightedSum += review.rating * review.weight;
      totalWeight += review.weight;
    });

    const weightedRating = totalWeight === 0 ? 0 : weightedSum / totalWeight;

    if (isClient) {
      // The client left this review -> The reviewee is the Freelancer.
      // We update the FreelancerProfile where the user field matches the revieweeId.
      await FreelancerProfile.findOneAndUpdate(
        { user: revieweeId },
        {
          averageRating: Number(averageRating),
          weightedRating: Number(weightedRating),
          totalReviews: allReviewsForUser.length,
          totalRatings: allReviewsForUser.length
        },
        { returnDocument: "after" },
      );
    } else {
      // The freelancer left this review -> The reviewee is the Client.
      // We update the ClientProfile where the user field matches the revieweeId.
      await ClientProfile.findOneAndUpdate(
        { user: revieweeId },
        {
          averageRating: Number(averageRating),
          weightedRating: Number(weightedRating),
          totalReviews: allReviewsForUser.length,
          totalRatings: allReviewsForUser.length
        },
        { returnDocument: "after" },
      );
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review,
    });
  } catch (error) {
    console.error("Review creation error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this project asset." });
    }
    return res
      .status(500)
      .json({ message: "Failed to submit project review." });
  }
};

// Get reviews received by a specific user profile
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "firstName lastName profilePicture")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    return res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to load reviews profile information." });
  }
};

export const getGigReviewStatus = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const isAssignedFreelancer =
      gig.assignedFreelancer &&
      gig.assignedFreelancer.toString() === req.user.id;

    let isOwningClient = false;
    if (req.user.role === "client") {
      const clientProfile = await ClientProfile.findOne({ user: req.user.id });
      const gigClientProfileId = gig.client?._id
        ? gig.client._id.toString()
        : gig.client?.toString();
      isOwningClient =
        clientProfile && gigClientProfileId === clientProfile._id.toString();
    }
    if (!isAssignedFreelancer && !isOwningClient) {
      return res
        .status(403)
        .json({ message: "Not authorized to view review status" });
    }

    const review = await Review.findOne({
      project: gigId,
      reviewer: req.user.id,
    });

    return res.json({
      success: true,
      hasReviewed: !!review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
