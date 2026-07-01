import mongoose, { Schema } from "mongoose";

const userProfileSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    firstName: {
      type: String,
      default: "User",
    },

    lastName: {
      type: String,
      default: "Name",
    },

    phone: {
      type: String,
      default: "123-456-7890",
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    location: {
      type: String,
      default: "India",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    // Professional Information
    headline: {
      type: String,
      default: "Software Engineer",
    },

    about: {
      type: String,
      default: "",
    },

    availability: {
      type: String,
      enum: ["Available", "Busy", "Not Available"],
      default: "Available",
    },
    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "intermediate",
        },
        yearsOfExperience: { type: Number, default: 0 },
      },
    ],
    certifications: [
      {
        title: String,
        issuedBy: String,
        issueDate: Date,
        certificateUrl: String,
      },
    ],

    languages: [
      {
        type: String,
      },
    ],

    experience: [
      {
        jobTitle: String,
        company: String,
        startDate: Date,
        endDate: Date,
        currentlyWorking: Boolean,
        description: String,
      },
    ],

    education: [
      {
        degree: String,
        institute: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],

    portfolio: {
      github: {
        type: String,
        default: "",
      },

      linkedin: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },

      resume: {
        type: String,
        default: "",
      },
    },

    profileCompletion: {
      type: Number,

      default: 0,
    },
  },
  { timestamps: true },
);

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
