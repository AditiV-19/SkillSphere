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

export const Review = mongoose.model("Review", reviewSchema);
