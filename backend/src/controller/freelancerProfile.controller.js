import mongoose from "mongoose";
import { ClientProfile, FreelancerProfile } from "../models/profile.model.js";
import { calculateProfileCompletion } from "../utils/profileCompletion.js";
import { sendNotification } from "../services/notification.services.js";

// Create Profile

export const createProfile = async (req, res) => {
  try {
    const existingProfile = await FreelancerProfile.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const profile = await FreelancerProfile.create({
      user: req.user.id,

      ...req.body,
    });

    return res.status(201).json({
      message: "Profile created successfully",

      profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",

      error: error.message,
    });
  }
};

// Get Profile

export const getProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({
      user: req.user.id,
    }).populate("user", "username email role isVerified");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }
    const profileObj = profile.toObject();
    profileObj.profileCompletion = calculateProfileCompletion(profileObj);

    res.status(200).json(profileObj);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update Profile

export const updateProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOneAndUpdate(
      {
        user: req.user.id,
      },

      req.body,

      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("user", "username email role isVerified");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }
    profile.profileCompletion = calculateProfileCompletion(profile.toObject());
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",

      error: error.message,
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOneAndDelete({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await FreelancerProfile.find()
      .populate("user", "username email role isVerified")
      .sort({ createdAt: -1 }); // Show newest profiles first

    const normalizedFreelancers = freelancers.map((profile) => {
      const profileObj = profile.toObject();
      return {
        ...profileObj,
        username: profileObj.user?.username || profileObj.username,
        email: profileObj.user?.email,
        role: profileObj.user?.role,
      };
    });

    return res.status(200).json({
      success: true,
      freelancers: normalizedFreelancers,
    });
  } catch (error) {
    console.error("Error retrieving freelancer directory matrices:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error reading active talent pipelines.",
      error: error.message,
    });
  }
};

// ==========================================
// FETCH SINGLE FREELANCER DETAILS BY ID
// ==========================================
export const getFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid freelancer ID format.",
      });
    }

    const freelancer = await FreelancerProfile.findOne({
      $or: [{ user: id }, { _id: id }],
    }).populate("user", "username email createdAt");

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "The requested freelancer profile could not be found.",
      });
    }

    // 4. Flatten properties cleanly for the frontend
    const profileObj = freelancer.toObject();

    if (req.user?.role === "client") {
      const requestingClientProfile = await ClientProfile.findOne({ user: req.user.id }).select("_id");
      if (requestingClientProfile && profileObj.availability?.slots?.length) {
        profileObj.availability.slots = profileObj.availability.slots.map((slot) => ({
          ...slot,
          bookedByMe:
            slot.isBooked &&
            slot.bookedBy?.toString() === requestingClientProfile._id.toString(),
        }));
      }
    }

    const normalizedProfile = {
      ...profileObj,
      name: `${profileObj.firstName || ""} ${profileObj.lastName || ""}`.trim(),
      username: profileObj.user?.username,
      email: profileObj.user?.email,
      memberSince: profileObj.user?.createdAt
        ? new Date(profileObj.user.createdAt).getFullYear()
        : "Recent",
    };

    return res.status(200).json({
      success: true,
      freelancer: normalizedProfile,
    });
  } catch (error) {
    console.error("Error in getFreelancerById controller:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid freelancer ID format.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving freelancer profile.",
      error: error.message,
    });
  }
};

export const searchFreelancers = async (req, res) => {
  try {
    const {
      q,
      location,
      experienceLevel,
      minRate,
      maxRate,
      minRating,
      availability,
      sort,
      page = 1,

      limit = 10,
    } = req.query;

    const query = {};

    const searchText = q?.trim() || "";

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    if (searchText) {
      query.$or = [
        {
          firstName: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          headline: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "skills.name": {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (minRating) {
      query.weightedRating = {
        $gte: Number(minRating),
      };
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (availability) {
      query["availability.status"] = availability;
    }

    const totalResults = await FreelancerProfile.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalResults / limitNumber));

    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = { weightedRating: -1 };
        break;

      case "reviews":
        sortOption = { totalReviews: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const freelancers = await FreelancerProfile.find(query)
      .populate("user", "username email profilePicture")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,

      page: pageNumber,

      limit: limitNumber,

      totalResults,

      totalPages,

      count: freelancers.length,

      hasNextPage: pageNumber < totalPages,

      hasPreviousPage: pageNumber > 1,

      freelancers,
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search freelancers.",
    });
  }
};

/*
==================================================
Submit Verification Request (Updated for Single-Step)
==================================================
*/
export const submitVerificationRequest = async (req, res) => {
    try {
        const freelancer = await FreelancerProfile.findOne({
            user: req.user.id
        });

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: "Freelancer profile not found"
            });
        }

        if (freelancer.verification.status === "pending") {
            return res.status(400).json({
                success: false,
                message: "Verification request already submitted."
            });
        }

        if (freelancer.verification.status === "verified") {
            return res.status(400).json({
                success: false,
                message: "You are already verified."
            });
        }

        // 👇 FIX: Check for req.file instead of req.body.url
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Verification document is required"
            });
        }

        // 👇 FIX: Extract the Cloudinary URL directly from Multer
        const url = req.file.path; 
        
        // Multer parses the other form fields into req.body automatically
        const documentType = req.body.documentType || "ID"; 

        // Push the new document into the array
        freelancer.verification.documents.push({
            url,
            documentType,
            uploadedAt: new Date()
        });

        freelancer.verification.status = "pending";
        freelancer.verification.submittedAt = new Date();
        freelancer.verification.rejectionReason = "";

        await freelancer.save();

        return res.status(200).json({
            success: true,
            message: "Verification request submitted successfully.",
            verification: freelancer.verification
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/*
==================================================
Get My Verification Status
==================================================
*/

export const getMyVerificationStatus = async (req, res) => {

    try {

        const freelancer = await FreelancerProfile.findOne({
            user: req.user.id
        });

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: "Freelancer not found"
            });
        }

        return res.status(200).json({
            success: true,
            verification: freelancer.verification,
            isVerified: freelancer.isVerified
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/*
==================================================
Admin Pending Requests
==================================================
*/

export const getPendingVerifications = async (req, res) => {

    try {

        const freelancers = await FreelancerProfile.find({
            "verification.status": "pending"
        })
            .populate(
                "user",
                "username email"
            )
            .sort({
                "verification.submittedAt": 1
            });

        return res.status(200).json({
            success: true,
            count: freelancers.length,
            freelancers
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/*
==================================================
Approve Verification
==================================================
*/
export const approveVerification = async (req, res) => {
    try {
        const badgeAwarded = req.body.badgeType || "Identity Verified";
        const freelancer = await FreelancerProfile.findById(req.params.id);

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: "Freelancer not found"
            });
        }
        freelancer.verification.status = "verified";
        freelancer.verification.verifiedAt = new Date();
        freelancer.verification.verifiedBy = req.user.id;

        // Add the badge only if they don't already have it
        if (!freelancer.verification.badges.includes(badgeAwarded)) {
            freelancer.verification.badges.push(badgeAwarded);
        }

        // Your .pre("save") hook will automatically flip freelancer.isVerified to true here
        await freelancer.save();

       await sendNotification({
        recipient: freelancer.user,
        sender: req.user.id,
        type: "VERIFICATION",
        title: "Verification Approved",
        message: `Congratulations! Your account has been verified with the ${badgeAwarded} badge.`,
        link: "/freelancer/profile",
      });

        return res.status(200).json({
            success: true,
            message: "Freelancer verified successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/*
==================================================
Reject Verification
==================================================
*/

export const rejectVerification = async (req, res) => {

    try {

        const { reason } = req.body;

        const freelancer = await FreelancerProfile.findById(req.params.id);

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: "Freelancer not found"
            });
        }

        freelancer.verification.status = "rejected";

        freelancer.verification.rejectionReason =
            reason || "Verification rejected.";

        freelancer.verification.verifiedBy = null;

        freelancer.verification.verifiedAt = null;

        freelancer.isVerified = false;

        await freelancer.save();

       await sendNotification({
        recipient: freelancer.user,
        sender: req.user.id,
        type: "VERIFICATION",
        title: "Verification Rejected",
        message: reason || "Your verification request has been rejected.",
        link: "/freelancer/profile",
      });

        return res.status(200).json({

            success: true,

            message: "Verification rejected."

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};