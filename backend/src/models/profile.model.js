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
      },
    },

    profileCompletion: {
      type: Number,

      default: 0,
    },
  },
  { timestamps: true },
);


const clientSchema = new Schema(
  {
    // ===========================
    // USER
    // ===========================
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ===========================
    // COMPANY DETAILS
    // ===========================
    companyLogo: {
      type: String,
      default: "",
    },

    companyName: {
      type: String,
      default: "UserName",
      trim: true,
      required: true,
    },

    companyDescription: {
      type: String,
      default: "",
      maxlength: 1500,
    },

    companyType: {
      type: String,
      enum: [
        "Startup",
        "Agency",
        "Enterprise",
        "Individual",
        "Government",
        "NGO",
      ],
    },

    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Gaming",
        "Retail",
        "Marketing",
        "Construction",
        "Other",
      ],
    },

    foundedYear: {
      type: Number,
      default: 0
    },

    companySize: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "500+",
      ],
    },

    location: {
      country: String,
      state: String,
      city: String,
      address: String,
    },

    // ===========================
    // CONTACT
    // ===========================
    contactPerson: {
      name: String,
      designation: String,
      email: String,
      phone: String,
    },

    // ===========================
    // LINKS
    // ===========================
    portfolio: {
      website: String,
      linkedin: String,
    },

    socials: {
      twitter: String,
      github: String,
      instagram: String,
      facebook: String,
    },

    // ===========================
    // HIRING
    // ===========================
    hiringPreferences: {
      remoteOnly: {
        type: Boolean,
        default: false,
      },

      preferredExperienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
      },

      preferredLanguages: [String],
    },

    isHiring: {
      type: Boolean,
      default: true,
    },

    // ===========================
    // PAYMENT
    // ===========================
    paymentDetails: {
      provider: {
        type: String,
        enum: ["razorpay", "stripe"],
      },

      customerId: String,

      defaultMethodId: String,
    },

    // ===========================
    // RELATIONS
    // ===========================
    postedGigs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Gig",
      },
    ],

    activeContracts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contract",
      },
    ],

    savedFreelancers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ===========================
    // REPUTATION
    // ===========================
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    // ===========================
    // ANALYTICS
    // ===========================
    stats: {
      gigsPosted: {
        type: Number,
        default: 0,
      },

      activeProjects: {
        type: Number,
        default: 0,
      },

      completedProjects: {
        type: Number,
        default: 0,
      },

      freelancersHired: {
        type: Number,
        default: 0,
      },

      totalSpent: {
        type: Number,
        default: 0,
      },

      repeatHires: {
        type: Number,
        default: 0,
      },
    },

    // ===========================
    // ACCOUNT STATUS
    // ===========================
    isVerified: {
      type: Boolean,
      default: false,
    },

    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

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

export const FreelancerProfile = mongoose.model(
  "FreelancerProfile",
  freelancerSchema,
);
