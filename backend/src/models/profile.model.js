import mongoose, { Schema } from "mongoose";

const freelancerSchema = new Schema(
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
      status: {
        type: String,
        enum: ["Available", "Busy", "Unavailable"],
        default: "Available",
      },
      // Add this to store actual bookable instances
      slots: [
        {
          startTime: { type: Date, required: true },
          endTime: { type: Date, required: true },
          isBooked: { type: Boolean, default: false },
          bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to client
        },
      ],
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
        url: { type: String, default: "" }, 
        fileName: { type: String, default: "" }, 
      }
    },

    profileCompletion: {
      type: Number,

      default: 0,
    },
  },
  { timestamps: true },
);

const clientSchema = new Schema({
  companyName: {
    type: String,
    trim: true,
  },

  companyWebsite: {
    type: String,
  },
  industry: {
    type: String,
  },

  billingDetails: {
    billingAddress: String,
    gstNumber: String, // if applicable
    preferredPaymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "bank_transfer"],
      default: "razorpay",
    },
  },

  postedGigs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Gig",
    },
  ],
  savedFreelancers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Module 8: Reputation as a client (how freelancers rate them)
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },

  // Analytics
  stats: {
    gigsPosted: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    activeGigs: {
      type: Number,
      default: 0,
    },
  },

  isVerified: {
    type: Boolean,
    default: false,
  }, // verified client badge
});

const adminSchema = new Schema({
  adminLevel: {
    type: String,
    enum: ["super_admin", "moderator", "support"],
    default: "moderator",
  },

  permissions: {
    manageUsers: { type: Boolean, default: true },
    suspendAccounts: { type: Boolean, default: true },
    verifyFreelancers: { type: Boolean, default: true },
    approveGigs: { type: Boolean, default: true },
    monitorPayments: { type: Boolean, default: false },
    resolveDisputes: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
  },

  // Links to AdminLogs collection (Module: Advanced Database Collections)
  actionLogs: [{ type: Schema.Types.ObjectId, ref: "AdminLog" }],

  managedDisputes: [{ type: Schema.Types.ObjectId, ref: "Dispute" }],
});

export const AdminProfile = mongoose.model("AdminProfile", adminSchema);

export const ClientProfile = mongoose.model("ClientProfile", clientSchema);

export const FreelancerProfile = mongoose.model("FreelancerProfile", freelancerSchema);
