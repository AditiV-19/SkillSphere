import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "MESSAGE",
        "INVITATION",
        "PROPOSAL",
        "GIG_ACCEPTED",
        "GIG_REJECTED",
        "NEGOTIATION",
        "MILESTONE",
        "PAYMENT",
        "SYSTEM",
        "BOOKING"
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient:1, read:1 });

notificationSchema.index({ recipient:1, createdAt:-1 });

export const Notification = mongoose.model("Notification", notificationSchema);