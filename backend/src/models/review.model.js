import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
      index: true,
    },

    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    weight: {
      type: Number,
      default: 1,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ---- Fraud detection metadata ----
    // metadata: {
    //   ipAddress: { type: String, default: null },
    //   userAgent: { type: String, default: null },
    //   deviceFingerprint: { type: String, default: null },
    // },

    // fraud: {
    //   score: { type: Number, default: 0, min: 0, max: 100 },
    //   status: {
    //     type: String,
    //     enum: ["clean", "suspicious", "flagged", "confirmed_fake"],
    //     default: "clean",
    //   },
    //   reasons: [
    //     {
    //       check: { type: String },
    //       weight: { type: Number },
    //       detail: { type: String },
    //     },
    //   ],
    //   reviewedByAdmin: { type: Boolean, default: false },
    //   adminDecision: {
    //     type: String,
    //     enum: ["pending", "approved", "removed"],
    //     default: "pending",
    //   },
    // },

    // isVisible: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  { timestamps: true },
);

reviewSchema.index(
  {
    project: 1,
    reviewer: 1,
    reviewee: 1,
  },
  { unique: true },
);

reviewSchema.index({ "fraud.status": 1 });

export const Review = mongoose.model("Review", reviewSchema);