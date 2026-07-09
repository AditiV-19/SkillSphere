import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true
    },
    freelancerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to Auth User ID matching your invite architecture
      required: true
    },
    description: {
      type: String,
      required: true
    },
    bidAmount: {
      type: Number,
      required: true
    },
    estimatedTime: {
      type: String, // e.g., "2 weeks", "10 days"
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "negotiating", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

proposalSchema.index({ gig: 1, freelancerUser: 1 }, { unique: true });

export const Proposal = mongoose.model("Proposal", proposalSchema);