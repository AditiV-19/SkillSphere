// models/Gig.js
import mongoose, { Schema } from "mongoose";

const gigSchema = new Schema(
  {
    // Points directly to the ClientProfile model
    client: {
      type: Schema.Types.ObjectId,
      ref: "ClientProfile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    skillsRequired: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    budget: {
      budgetType: {
        type: String,
        enum: ["fixed", "hourly"],
        required: true,
      },
      min: { type: Number, required: true, min: 0 },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Milestone tracking arrays [cite: 48, 140]
    milestones: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        amount: {
          type: Number,
          required: true,
        },
        dueDate: {
          type: Date,
          default: "",
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed"],
          default: "pending",
        },
      },
    ],

    location: {
      remote: {
        type: Boolean,
        default: true,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      // GeoJSON Point format for advanced location-based queries
      geo: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },

    // Attachments for documents (Wire up with Cloudinary in Week 4) [cite: 49, 169]
    attachments: [
      {
        type: String,
      },
    ],

    // Keeps references pointing to User to easily track IDs from auth tokens
    invitedFreelancers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedFreelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
      index: true,
    },

    proposalsCount: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    
    progressLogs: [
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 1000 },
    milestone: { type: Schema.Types.ObjectId }, // optional — which milestone this update relates to
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
],
  },
  {
    timestamps: true,
  },
);

// Enable Geospatial Queries for Hyperlocal Search [cite: 3, 107]
gigSchema.index({ "location.geo": "2dsphere" }, { sparse: true });

// Compound text index to handle advanced string matches on Title and Skills
gigSchema.index({ skillsRequired: 1 });

export const Gig = mongoose.model("Gig", gigSchema);
