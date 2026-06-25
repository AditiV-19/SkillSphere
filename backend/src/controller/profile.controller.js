import {UserProfile} from '../models/profile.model.js'

// Create Profile

export const createProfile = async(req, res) =>{
    try {
        const {bio, skills, experience, profilePicture, location} = req.body;

        //allow non-exisiting profile
        const existing = await UserProfile.findOne({user: req.user.id})

        if(existing){
            return res.status(400).json({ message: 'Profile already exists' })
        }

        // create user
        const profile = await UserProfile.create({
            user: req.user.id,
            bio,
            skills,
            experience,
            profilePicture,
            location
        });

        res.status(201).json({
            message: 'Profile created successfully!',
            profile
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


// Get Profile

export const getProfile = async(req, res) =>{
    try {
        //allow exisiting profile
        
        const profile = await UserProfile.findOne({user: req.user.id})
        .populate('user', '-password')

        if(!profile){
            return res.status(400).json({ message: 'Profile not found' })
        }

        res.status(201).json({
            profile
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// Update Profile

export const updateProfile = async(req, res) =>{
    try {
        //allow exisiting profile
        
        const profile = await UserProfile.findOne({user: req.user.id})
        .populate('user', '-password')

        if(!profile){
            return res.status(400).json({ message: 'Profile not found' })
        }

        Object.assign(profile, req.body);   //assign body.attribute (if exists) to profile 
        await profile.save();


        res.status(201).json({
            message: 'Profile updated!',
            profile
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}