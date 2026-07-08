import mongoose from "mongoose";
import { Gig } from "../models/gig.model.js";
import { ClientProfile } from "../models/profile.model.js";

// ==========================================
// 1. CREATE GIG
// ==========================================
export const createGig = async (req, res) => {
    try {
        const clientProfile = await ClientProfile.findOne({
            user: req.user.id,
        });

        if (!clientProfile) {
            return res.status(403).json({
                message: "Access Denied. Only registered clients can create gigs.",
            });
        }

        const {
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

        let geo = undefined;

        if (latitude && longitude) {
            geo = {
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude),
                ],
            };
        }

        const newGig = await Gig.create({
            client: clientProfile._id,
            title,
            description,
            category,
            skillsRequired,
            budget,
            milestones,

            location: {
                remote: remote ?? true,
                city,
                state,
                country,
                geo,
            },
        });

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
                $in: skills
                    .split(",")
                    .map((skill) => skill.trim().toLowerCase()),
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
                        coordinates: [
                            parseFloat(lng),
                            parseFloat(lat),
                        ],
                    },
                    $maxDistance: Number(distance) * 1000,
                },
            };
        }

        const gigs = await Gig.find(query)
            .populate({
                path: "client",
                select:
                    "companyName companyLogo companyDescription industry location",
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
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Gig ID.",
            });
        }

        const gig = await Gig.findById(id)
            .populate({
                path: "client",
                select:
                    "companyName companyLogo companyDescription industry location",
            })
            .lean();

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found.",
            });
        }

        return res.status(200).json({
            success: true,
            gig,
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
        if (milestones !== undefined)
            updateData.milestones = milestones;
        if (status !== undefined) updateData.status = status;

        // Location fields
        if (remote !== undefined)
            updateData["location.remote"] = remote;

        if (city !== undefined)
            updateData["location.city"] = city;

        if (state !== undefined)
            updateData["location.state"] = state;

        if (country !== undefined)
            updateData["location.country"] = country;

        // GeoJSON
        if (latitude !== undefined && longitude !== undefined) {
            updateData["location.geo"] = {
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude),
                ],
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
                new: true,
                runValidators: true,
            }
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
        await ClientProfile.findByIdAndUpdate(
            clientProfile._id,
            {
                $pull: {
                    postedGigs: id,
                },
            }
        );

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