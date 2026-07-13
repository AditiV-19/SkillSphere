import { FreelancerProfile } from "../models/profile.model.js";
import { calculateProfileCompletion } from "../utils/profileCompletion.js";

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

    // 1. Locate the freelancer document by its ID and pull owner details
    const freelancer = await FreelancerProfile.findById(id).populate(
      "user",
      "name username email createdAt",
    );

    // 2. Fail fast if the profile doesn't exist
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "The requested freelancer profile index could not be located.",
      });
    }

    // 3. Flatten properties cleanly for your frontend layouts
    const profileObj = freelancer.toObject();
    const normalizedProfile = {
      ...profileObj,
      name:
        profileObj.user?.name || profileObj.name || "Independent Professional",
      username:
        profileObj.user?.username || profileObj.username || "professional",
      email: profileObj.user?.email || "",
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

    // Catch invalid MongoDB format casts safely (e.g. random letters passed as id strings)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID parameter formatting configuration.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving developer profile records.",
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

    if (availability) {
      query["availability.status"] = availability;
    }

    const totalResults = await FreelancerProfile.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limitNumber);

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
