import mongoose, { Schema } from 'mongoose'

const userProfileSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        bio: {
            type: String,
            default: ''
        },

        skills: {
            type: [String],
            default: []
        },

        experience: {
            type: String,
            default: ''
        },

        profilePicture: {
            type: String,
            default: ''
        },

        location: {
            type: String,
            default: ''
        }
    },
    {timestamps: true}
)

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);