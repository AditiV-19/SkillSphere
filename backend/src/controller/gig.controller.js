import mongoose from "mongoose";
import { Gig } from "../models/gig.model.js";
import { ClientProfile } from "../models/profile.model.js";
import { Proposal } from "../models/proposal.model.js";
import { sendNotification } from "../services/notification.services.js";
// ==========================================
// 1. CREATE GIG (CONSOLIDATED & CLEANED)
// ==========================================
export const createGig = async (req, res) => {
  try {
    const clientProfile = await ClientProfile.findOne({
      user: req.user.id,
    });

    if (!clientProfile) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Only registered clients can create gigs.",
      });
    }

    // 1. Pull values from req.body ONCE
    let {
      title,
      description,
      category,
      skillsRequired,
      budget,
      milestones,
      remote,
      city,
      state,
      country,
      latitude,
      longitude,
    } = req.body;

    // 🚀 2. ADAPTIVE PARSING FOR BUDGET
    if (budget) {
      if (typeof budget === "string") {
        try {
          budget = JSON.parse(budget);
        } catch (e) {
          console.error(
            "❌ Multer caught invalid budget string formatting:",
            budget,
          );
          return res.status(400).json({
            success: false,
            message: "Invalid budget payload format configuration.",
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing required contract budget data structure metrics.",
      });
    }

    // 🚀 3. ADAPTIVE PARSING FOR MILESTONES
    if (milestones && typeof milestones === "string") {
      try {
        milestones = JSON.parse(milestones);
      } catch (e) {
        milestones = [];
      }
    }
    const cleanMilestones = Array.isArray(milestones) ? milestones : [];

    // 🚀 4. ADAPTIVE PARSING FOR SKILLS
    if (skillsRequired && typeof skillsRequired === "string") {
      try {
        skillsRequired = JSON.parse(skillsRequired);
      } catch (e) {
        skillsRequired = skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    const cleanSkills = Array.isArray(skillsRequired)
      ? skillsRequired
      : [skillsRequired];

    // 5. EXTRACT FILES STREAM FROM MULTI-PART ENVELOPE
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        url: file.path || file.secure_url,
        name: file.originalname,
      }));
    }

    // 6. BUILD GEOGRAPHIC INTERACTION METRICS
    const isRemote = remote === "true" || remote === true; // Handle form checkbox evaluations safely
    const locationData = {
      remote: isRemote,
      city: isRemote ? undefined : city,
      state: isRemote ? undefined : state,
      country: isRemote ? undefined : country,
    };

    if (!isRemote && latitude && longitude) {
      locationData.geo = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    // 7. DEPLOY SINGLE TRANSACT WRITE OPERATION TO MONGO
    const newGig = await Gig.create({
      client: clientProfile._id,
      title,
      description,
      category,
      skillsRequired: cleanSkills,
      budget,
      milestones: cleanMilestones,
      location: locationData,
      attachments, // ✅ FIXED: Included document links inside database create transaction
    });

    // 8. UPDATE CLIENT PROFILE TRACKER ARCHITECTURE
    clientProfile.postedGigs.push(newGig._id);
    await clientProfile.save();

    return res.status(201).json({
      success: true,
      message: "Gig created successfully.",
      gig: newGig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. GET ALL GIGS
// ==========================================
export const getGigs = async (req, res) => {
  try {
    const {
      search,
      category,
      skills,
      minBudget,
      maxBudget,
      budgetType,
      lng,
      lat,
      distance,
    } = req.query;

    const query = {
      status: "open",
    };

    // Text Search
    if (search) {
      query.$text = {
        $search: search,
      };
    }

    // Category
    if (category) {
      query.category = category.toLowerCase();
    }

    // Skills
    if (skills) {
      query.skillsRequired = {
        $in: skills.split(",").map((skill) => skill.trim().toLowerCase()),
      };
    }

    // Budget Type
    if (budgetType) {
      query["budget.budgetType"] = budgetType;
    }

    // Budget Range
    if (minBudget) {
      query["budget.min"] = {
        $gte: Number(minBudget),
      };
    }

    if (maxBudget) {
      query["budget.max"] = {
        $lte: Number(maxBudget),
      };
    }

    // Nearby Search
    if (lng && lat && distance) {
      query["location.geo"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: Number(distance) * 1000,
        },
      };
    }

    const gigs = await Gig.find(query)
      .populate({
        path: "client",
        select: "companyName companyLogo companyDescription industry location",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: gigs.length,
      gigs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. GET GIG BY ID
// ==========================================
export const getGigById = async (req, res) => {
  try {
    const { gigId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gig ID.",
      });
    }

    const gig = await Gig.findById(gigId)
      .populate({
        path: "client",
        select: "companyName companyLogo companyDescription industry location",
      })
      .lean();

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found.",
      });
    }

    let hasApplied = false;
    if (req.user && req.user.role === "freelancer") {
      const existingProposal = await Proposal.findOne({
        gig: gigId,
        freelancerUser: req.user.id,
      });
      if (existingProposal) hasApplied = true;
    }

    return res.status(200).json({
      success: true,
      gig,
      hasApplied,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE GIG (Protected: Client Owner Only)
// ==========================================
export const updateGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const id = gigId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gig ID.",
      });
    }

    // Get logged-in client's profile
    const clientProfile = await ClientProfile.findOne({
      user: req.user.id,
    });

    if (!clientProfile) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Client profile not found.",
      });
    }

    // Find gig
    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found.",
      });
    }

    // Verify ownership
    if (gig.client.toString() !== clientProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own gigs.",
      });
    }

    const {
      title,
      description,
      category,
      skillsRequired,
      budget,
      milestones,
      status,
      remote,
      city,
      state,
      country,
      latitude,
      longitude,
    } = req.body;

    const updateData = {};

    // Basic fields
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (skillsRequired !== undefined)
      updateData.skillsRequired = skillsRequired;
    if (budget !== undefined) updateData.budget = budget;
    if (milestones !== undefined) updateData.milestones = milestones;
    if (status !== undefined) updateData.status = status;

    // Location fields
    if (remote !== undefined) updateData["location.remote"] = remote;

    if (city !== undefined) updateData["location.city"] = city;

    if (state !== undefined) updateData["location.state"] = state;

    if (country !== undefined) updateData["location.country"] = country;

    // GeoJSON
    if (latitude !== undefined && longitude !== undefined) {
      updateData["location.geo"] = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (
      budget &&
      budget.min !== undefined &&
      budget.max !== undefined &&
      budget.max < budget.min
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget max must be greater than or equal to budget min.",
      });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Gig updated successfully.",
      gig: updatedGig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. DELETE GIG (Protected: Client Owner Only)
// ==========================================
export const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gig ID.",
      });
    }

    // Get logged-in client's profile
    const clientProfile = await ClientProfile.findOne({
      user: req.user.id,
    });

    if (!clientProfile) {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Client profile not found.",
      });
    }

    // Find gig
    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found.",
      });
    }

    // Verify ownership
    if (gig.client.toString() !== clientProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own gigs.",
      });
    }

    // Delete the gig
    await Gig.findByIdAndDelete(id);

    // Remove reference from postedGigs
    await ClientProfile.findByIdAndUpdate(clientProfile._id, {
      $pull: {
        postedGigs: id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Gig deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 6. Invite Freelancers
// ==========================================

export const inviteFreelancer = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { freelancerUserId } = req.body;

    // 1. Find the client profile of the logged-in user
    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    if (!clientProfile) {
      return res
        .status(403)
        .json({ message: "Only clients can invite freelancers." });
    }

    const gig = await Gig.findById(gigId);

    if (
      gig.invitedFreelancers.some(
        (id) => id.toString() === freelancerUserId
      )
    ) {
      return res.status(400).json({
        message: "Freelancer has already been invited.",
      });
}

    // 2. Atomically verify ownership, status, and add the freelancer
    const updatedGig = await Gig.findOneAndUpdate(
      {
        _id: gigId,
        client: clientProfile._id,
        status: "open",
      },
      {
        $addToSet: { invitedFreelancers: freelancerUserId },
      },
      { returnDocument: "after" }, // Returns the modified document if needed
    );

    // 3. Handle errors if the query failed to match a document
    if (!updatedGig) {
      // Pinpoint the exact reason for failure to give clean API feedback
      const gigExists = await Gig.findById(gigId);
      if (!gigExists) return res.status(404).json({ message: "Gig not found" });
      if (gigExists.client.toString() !== clientProfile._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to invite on this gig" });
      }
      if (gigExists.status !== "open") {
        return res
          .status(400)
          .json({ message: "Gig is no longer open for invites" });
      }
    }

    // TODO Week 3: fire a notification here (Socket.IO + email) using updatedGig data
    await sendNotification({
      recipient: freelancerUserId,
      sender: req.user.id,
      type: "INVITATION",
      title: "New Invitation",
      message: `${clientProfile.companyName} invited you to apply for "${updatedGig.title}".`,
      link: `/freelancer/invitations`,
    });
    
    return res.json({
      message: "Freelancer invited successfully",
      gig: updatedGig,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during invitation",
      error: error.message,
    });
  }
};

// ==========================================
// 7. Uninvite Freelancers
// ==========================================
export const uninviteFreelancer = async (req, res) => {
  try {
    const { gigId, freelancerUserId } = req.params;

    // 1. Find the client profile of the logged-in user
    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    if (!clientProfile) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 2. Atomically verify ownership and pull the freelancer out of the array
    const updatedGig = await Gig.findOneAndUpdate(
      {
        _id: gigId,
        client: clientProfile._id,
      },
      {
        $pull: { invitedFreelancers: freelancerUserId },
      },
      { returnDocument: "after" },
    );

    // 3. Handle errors if the query failed to match a document
    if (!updatedGig) {
      const gigExists = await Gig.findById(gigId);
      if (!gigExists) return res.status(404).json({ message: "Gig not found" });
      return res
        .status(403)
        .json({ message: "Not authorized to modify this gig" });
    }

    return res.json({ message: "Invite removed successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while removing invite",
      error: error.message,
    });
  }
};

// ==========================================
// 8. Invitations on Freelancers side
// ==========================================
export const getFreelancerInvitations = async (req, res) => {
  try {
    // req.user.id is extracted directly from the encrypted cookie/JWT header
    const loggedInFreelancerUserId = req.user.id;
    console.log(
      "Logged-in freelancer's user id:",
      req.user.id,
      typeof req.user.id,
    );
    const invitations = await Gig.find({
      status: "open",
      // Strict matching: The array MUST contain this specific user's ID
      invitedFreelancers: loggedInFreelancerUserId,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, invitations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch invitations" });
  }
};

// Assigned gigs for freelancer
export const getFreelancerAssignedGigs = async (req, res) => {
  try {
    // 1. Find all proposals submitted by this user that have been officially accepted
    // req.user.id is populated automatically by your authMiddleware
    const acceptedProposals = await Proposal.find({
      freelancerUser: req.user.id,
      status: "accepted",
    }).select("gig"); // We only need the gig IDs to perform the secondary lookup

    if (!acceptedProposals || acceptedProposals.length === 0) {
      return res.json({
        success: true,
        gigs: [],
      });
    }

    // 2. Extract out all unique Gig ObjectIDs from those accepted proposals
    const assignedGigIds = acceptedProposals.map((proposal) => proposal.gig);

    // 3. Fetch the full details of those specific gigs
    // We populate the client field to show the company details on the frontend cards
    const gigs = await Gig.find({ _id: { $in: assignedGigIds } })
      .populate("client", "companyName industry location")
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    console.error("Error fetching assigned gigs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error gathering contract workspace files.",
      error: error.message,
    });
  }
};

// Active Client Gigs
export const getActiveGigs = async (req, res) => {
  try {
    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    if (!clientProfile)
      return res.status(404).json({ message: "Client profile not found" });

    const gigs = await Gig.find({
      client: clientProfile._id,
      status: { $in: ["in_progress", "completed"] }, // only gigs with someone actually assigned
    })
      .populate(
        "assignedFreelancer",
        "firstName lastName profilePicture headline",
      )
      .sort({ createdAt: -1 });

    const withProgress = gigs.map((gig) => {
      const total = gig.milestones.length;
      const completed = gig.milestones.filter(
        (m) => m.status === "completed",
      ).length;
      return {
        ...gig.toObject(),
        completionPercentage: total ? Math.round((completed / total) * 100) : 0,
      };
    });

    res.json({ success: true, gigs: withProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch active gigs" });
  }
};

// Milestone Status
export const getGigProgress = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId)
      .select("title status milestones client assignedFreelancer")
      .populate("assignedFreelancer", "firstName lastName profilePicture")
      .populate({
        path: "client",
        select: "companyName companyLogo user",
        populate: { path: "user", select: "firstName lastName" },
      });

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const assignedFreelancerId =
      gig.assignedFreelancer?._id?.toString?.() ||
      gig.assignedFreelancer?.toString();
    const isAssignedFreelancer = assignedFreelancerId === req.user.id;

    let isOwningClient = false;
    if (req.user.role === "client") {
      const clientProfile = await ClientProfile.findOne({ user: req.user.id });
      const gigClientProfileId =
        gig.client?._id?.toString?.() || gig.client?.toString();
      isOwningClient =
        clientProfile && gigClientProfileId === clientProfile._id.toString();
    }

    if (!isAssignedFreelancer && !isOwningClient) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this gig's progress" });
    }

    const total = gig.milestones.length;
    const completed = gig.milestones.filter(
      (m) => m.status === "completed",
    ).length;
    const completionPercentage = total
      ? Math.round((completed / total) * 100)
      : 0;

    res.json({
      success: true,
      gig: {
        _id: gig._id,
        title: gig.title,
        status: gig.status,
        assignedFreelancer: gig.assignedFreelancer,
        client: gig.client,
        milestones: gig.milestones,
        completionPercentage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch gig progress" });
  }
};

export const updateMilestoneStatus = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;
    const { status } = req.body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (
      !gig.assignedFreelancer ||
      gig.assignedFreelancer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Only the assigned freelancer can update milestones",
      });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    milestone.status = status;
    const totalMilestones = gig.milestones.length;

    const completedMilestones = gig.milestones.filter(
      (m) => m.status === "completed",
    ).length;

    if (completedMilestones === totalMilestones) {
      gig.status = "completed";
    } else {
      gig.status = "in_progress";
    }
    const completionPercentage = totalMilestones
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    await gig.save();

    const freelancer = await User.findById(req.user.id);

    await sendNotification({
        recipient: gig.client,
        sender: req.user.id,
        type: "MILESTONE",
        title: "Milestone Updated",
        message: `${freelancer.firstname} updated "${milestone.title}" to ${status}.`,
        link: `/client/gigs/${gig._id}`,
    });

    res.json({
      success: true,
      milestone,
      gigStatus: gig.status,
      completionPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update milestone" });
  }
};

export const updateMilestoneDeadline = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.params;
    const { dueDate } = req.body; // pass null/"" to clear it

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    if (
      !clientProfile ||
      gig.client.toString() !== clientProfile._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this gig" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    milestone.dueDate = dueDate || undefined;
    await gig.save();

    res.json({ success: true, milestone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update milestone deadline" });
  }
};

export const addProgressLog = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { message, milestoneId, fileUrl, fileName } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Log message is required" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (
      !gig.assignedFreelancer ||
      gig.assignedFreelancer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Only the assigned freelancer can post progress updates",
      });
    }

    gig.progressLogs.push({
      author: req.user.id,
      message: message.trim(),
      milestone: milestoneId || undefined,
      fileUrl: fileUrl || "",
      fileName: fileName || "",
    });

    await gig.save();

    const newLog = gig.progressLogs[gig.progressLogs.length - 1];
    res.json({ success: true, log: newLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add progress log" });
  }
};

export const getProgressLogs = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId)
      .select("client assignedFreelancer progressLogs")
      .populate("progressLogs.author", "firstName lastName profilePicture");

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const isAssignedFreelancer =
      gig.assignedFreelancer &&
      gig.assignedFreelancer.toString() === req.user.id;

    let isOwningClient = false;
    if (req.user.role === "client") {
      const clientProfile = await ClientProfile.findOne({ user: req.user.id });
      isOwningClient =
        clientProfile && gig.client.toString() === clientProfile._id.toString();
    }

    if (!isAssignedFreelancer && !isOwningClient) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const sortedLogs = [...gig.progressLogs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json({ success: true, logs: sortedLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch progress logs" });
  }
};

//Search Gigs
export const searchGigs = async (req, res) => {
  try {
    const {
      q,
      category,
      budgetType,
      minBudget,
      maxBudget,
      remote,
      status,
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
        { title: { $regex: searchText, $options: "i" } },
        { description: { $regex: searchText, $options: "i" } },
        { skillsRequired: { $regex: searchText, $options: "i" } },
        { category: { $regex: searchText, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category.toLowerCase();
    }

    if (budgetType) {
      query["budget.budgetType"] = budgetType;
    }

    if (minBudget) {
      query["budget.max"] = {
        ...query["budget.max"],
        $gte: Number(minBudget),
      };
    }

    if (maxBudget) {
      query["budget.min"] = {
        ...query["budget.min"],
        $lte: Number(maxBudget),
      };
    }

    if (remote === "true" || remote === "false") {
      query["location.remote"] = remote === "true";
    }

    if (status) {
      query.status = status;
    }

    const totalResults = await Gig.countDocuments({ ...query, status: "open" });
    const totalPages = Math.max(1, Math.ceil(totalResults / limitNumber));

    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "budget-high":
        sortOption = { "budget.max": -1 };
        break;
      case "budget-low":
        sortOption = { "budget.min": 1 };
        break;
      case "proposals":
        sortOption = { proposalsCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const gigs = await Gig.find({ ...query, status: "open" })
      .populate("client", "companyName")
      .populate("assignedFreelancer", "username")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      page: pageNumber,
      totalPages,
      totalResults,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search Gigs.",
    });
  }
};
