import {FreelancerProfile} from '../models/profile.model.js'
import {calculateProfileCompletion} from '../utils/profileCompletion.js'

// Create Profile

export const createProfile = async (req, res) => {

    try {

        const existingProfile = await FreelancerProfile.findOne({
            user: req.user.id
        });

        if (existingProfile) {

            return res.status(400).json({
                message: "Profile already exists"
            });

        }

        const profile = await FreelancerProfile.create({

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

        const profile = await FreelancerProfile.findOne({
            user: req.user.id
        }).populate("user", "username email role isVerified");

        if (!profile) {

            return res.status(404).json({
                message: "Profile not found"
            });

        }
         const profileObj = profile.toObject();
        profileObj.profileCompletion = calculateProfileCompletion(profileObj);

        res.status(200).json(profileObj);

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

        const profile = await FreelancerProfile.findOneAndUpdate(

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
        profile.profileCompletion = calculateProfileCompletion(profile.toObject());
        await profile.save();

        res.status(200).json(profile);

    }

    catch (error) {

        res.status(500).json({

            message: "Internal Server Error",

            error: error.message

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