import {UserProfile} from '../models/profile.model.js'

// Create Profile

export const createProfile = async (req, res) => {

    try {

        const existingProfile = await UserProfile.findOne({
            user: req.user.id
        });

        if (existingProfile) {

            return res.status(400).json({
                message: "Profile already exists"
            });

        }

        const profile = await UserProfile.create({

            user: req.user.id,

            ...req.body

        });

        return res.status(201).json({

            message: "Profile created successfully",

            profile

        });

    }

    catch (error) {

        return res.status(500).json({

            message: "Internal Server Error",

            error: error.message

        });

    }

};


// Get Profile

export const getProfile = async (req, res) => {

    try {

        const profile = await UserProfile.findOne({
            user: req.user.id
        }).populate("user", "username email role isVerified");

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        res.status(200).json(profile);

    }

    catch (error) {

        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });

    }

};

// Update Profile

export const updateProfile = async (req, res) => {

    try {

        const profile = await UserProfile.findOneAndUpdate(

            {
                user: req.user.id
            },

            req.body,

            {
                new: true,
                runValidators: true
            }

        ).populate("user", "username email role isVerified");

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }

        res.status(200).json({

            message: "Profile updated successfully",

            profile

        });

    }

    catch (error) {

        res.status(500).json({

            message: "Internal Server Error",

            error: error.message

        });

    }

};