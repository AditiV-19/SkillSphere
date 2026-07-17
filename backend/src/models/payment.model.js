import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

    milestone: { 
        type: mongoose.Schema.Types.ObjectId 
    }, // subdoc id inside gig.milestones

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: { 
        type: Number,
        required: true 
    }, // in rupees (whole currency unit, not paise)

    currency: { 
        type: String, 
        default: "INR" 
    },

    razorpayOrderId: { 
        type: String, 
        required: true 
    },

    razorpayPaymentId: { 
        type: String 
    },
    
    razorpaySignature: { 
        type: String 
    },

    status: {
      type: String,
      enum: ["created", "held", "released", "paid_out", "refunded", "failed"],
      default: "created",
    },

    refundId: { 
        type: String 
    },

    refundReason: { 
        type: String 
    },
    
    payoutSimulated: { 
        type: Boolean, 
        default: false 
    },

    payoutId: { 
        type: String 
    },

    heldAt: Date,
    releasedAt: Date,
    paidOutAt: Date,
    refundedAt: Date,
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
