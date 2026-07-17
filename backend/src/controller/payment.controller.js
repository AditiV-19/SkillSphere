import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import { Payment } from "../models/payment.model.js";
import { Gig } from "../models/gig.model.js";
import { sendNotification } from "../services/notification.services.js";
import { ClientProfile, FreelancerProfile } from "../models/profile.model.js";

// ---------- 1. CREATE ORDER (client initiates payment for a milestone) ----------

export const createOrder = async (req, res) => {
  try {
    const { gigId, milestoneId } = req.body;

    const gig = await Gig.findById(gigId).populate([
      { path: "assignedFreelancer", select: "firstName lastName email" },
      {
        path: "client",
        select: "companyName user",
        populate: { path: "user", select: "firstName lastName email" },
      },
    ]);

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (!gig.client?.user || gig.client?.user._id.toString() !== req.user?.id) {
      return res
        .status(403)
        .json({ message: "Only the gig's client can pay for it" });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    if (!gig.assignedFreelancer) {
      return res
        .status(400)
        .json({ message: "No freelancer assigned to this gig yet" });
    }

    if (milestone.paymentStatus !== "unfunded") {
      return res.status(400).json({
        message: `This milestone is already '${milestone.paymentStatus}' and cannot be funded again`,
      });
    }

    // Razorpay wants amount in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(milestone.amount * 100);

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `ms_${milestoneId}`,
      notes: {
        gigId: gigId.toString(),
        milestoneId: milestoneId.toString(),
        clientId: req.user.id,
        freelancerId: gig.assignedFreelancer.toString(),
      },
    });

    const payment = await Payment.create({
      gig: gig._id,
      milestone: milestone._id,
      client: req.user.id,
      freelancer: gig.assignedFreelancer,
      amount: milestone.amount,
      razorpayOrderId: order.id,
      status: "created",
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose, needed by frontend Checkout
      paymentRecordId: payment._id,
      clientName: gig.client.companyName,
      clientEmail: gig.client.user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// ---------- 2. VERIFY PAYMENT (called right after Razorpay Checkout succeeds) ----------

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Payment verification failed — signature mismatch" });
    }
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    if (payment.client.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to verify this payment" });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "held"; // money is now in escrow
    payment.heldAt = new Date();
    await payment.save();

    const gig = await Gig.findById(payment.gig);
    const milestone = gig.milestones.id(payment.milestone);
    milestone.paymentStatus = "funded";
    await gig.save();

    await sendNotification({
      recipient: gig.assignedFreelancer,
      sender: req.user.id,
      type: "PAYMENT",
      title: "Milestone Funded",
      message: `"${milestone.title}" has been funded (₹${payment.amount}) and is now in escrow.`,
      link: `/freelancer/tracker/${gig._id}`,
    });

    res.json({ message: "Payment verified and held in escrow", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// ---------- 3. RELEASE MILESTONE (client approves work → release from escrow) ----------

export const releaseMilestone = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.client.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the client can release this payment" });
    }
    console.log(payment.status);

    if (payment.status !== "held") {
      return res
        .status(400)
        .json({
          message: `Cannot release a payment with status '${payment.status}'`,
        });
    }

    const gig = await Gig.findById(payment.gig);
    const milestone = gig.milestones.id(payment.milestone);

    if (milestone.status !== "completed") {
      return res.status(400).json({
        message:
          "The freelancer must mark this milestone as completed before you can release payment",
      });
    }

    payment.status = "released";
    payment.releasedAt = new Date();
    await payment.save();

    milestone.paymentStatus = "released";
    await gig.save();

    // Trigger payout (simulated unless RazorpayX Route is configured)
    await triggerPayout(payment, gig, milestone);

    res.json({ message: "Milestone released and payout triggered", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to release milestone" });
  }
};

// ---------- 4. PAYOUT (real Route call shape, falls back to simulation) ----------

export const triggerPayout = async (payment, gig, milestone) => {
  try {
    // Real production call would look like:
    //
    // const payout = await razorpayXInstance.payouts.create({
    //   account_number: PLATFORM_ACCOUNT_NUMBER,
    //   fund_account_id: freelancer.razorpayFundAccountId,
    //   amount: Math.round(payment.amount * 100),
    //   currency: "INR",
    //   mode: "IMPS",
    //   purpose: "payout",
    //   queue_if_low_balance: true,
    // });
    //
    // This requires RazorpayX business KYC, so until that's set up we
    // simulate it and record it identically in the DB, so the rest of the
    // app (freelancer earnings page, admin analytics) works unchanged.

    payment.status = "paid_out";
    payment.payoutSimulated = true;
    payment.payoutId = `simulated_payout_${Date.now()}`;
    payment.paidOutAt = new Date();
    await payment.save();

    await sendNotification({
      recipient: payment.freelancer,
      sender: payment.client,
      type: "PAYMENT",
      title: "Payment Received",
      message: `₹${payment.amount} for "${milestone.title}" has been paid out to you.`,
      link: `/freelancer/tracker/${gig._id}`,
    });

    console.log(
      `[PAYOUT SIMULATED] ₹${payment.amount} → freelancer ${payment.freelancer}`,
    );
  } catch (err) {
    console.error("Payout trigger failed:", err);
  }
};

// ---------- 5. REFUND ----------

export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Only the client, or an admin (dispute resolution), can refund
    const isOwningClient = payment.client.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwningClient && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to refund this payment" });
    }

    if (payment.status !== "held") {
      return res.status(400).json({
        message: `Only payments still in escrow can be refunded. Current status: '${payment.status}'`,
      });
    }

    const refund = await razorpayInstance.payments.refund(
      payment.razorpayPaymentId,
      {
        amount: Math.round(payment.amount * 100),
        notes: { reason: reason || "Client requested refund" },
      },
    );

    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundReason = reason || "Client requested refund";
    payment.refundedAt = new Date();
    await payment.save();

    const gig = await Gig.findById(payment.gig);
    const milestone = gig.milestones.id(payment.milestone);
    milestone.paymentStatus = "refunded"; // reopen milestone for re-funding later
    await gig.save();

    await sendNotification({
      recipient: payment.freelancer,
      sender: req.user.id,
      type: "PAYMENT",
      title: "Payment Refunded",
      message: `The escrow payment for "${milestone.title}" was refunded to the client.`,
      link: `/freelancer/tracker/${gig._id}`,
    });

    res.json({ message: "Payment refunded", payment, milestone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refund failed", error: err.message });
  }
};

// ---------- 6. TRANSACTION HISTORY ----------

export const getMyTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {
      $or: [{ client: req.user.id }, { freelancer: req.user.id }],
    };

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate("gig", "title")
      .populate("client", "username email role")
      .populate("freelancer", "username email role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    // Collect unique user ids
    const clientIds = [
      ...new Set(payments.map((p) => p.client?._id.toString())),
    ];

    const freelancerIds = [
      ...new Set(payments.map((p) => p.freelancer?._id.toString())),
    ];

    // Fetch profiles
    const clientProfiles = await ClientProfile.find({
      user: { $in: clientIds },
    }).lean();

    const freelancerProfiles = await FreelancerProfile.find({
      user: { $in: freelancerIds },
    }).lean();

    // Create lookup maps
    const clientMap = new Map(
      clientProfiles.map((profile) => [
        profile.user.toString(),
        profile,
      ])
    );

    const freelancerMap = new Map(
      freelancerProfiles.map((profile) => [
        profile.user.toString(),
        profile,
      ])
    );

    // Merge profile data
    const formattedPayments = payments.map((payment) => {
      const paymentObj = payment.toObject();

      const clientProfile = clientMap.get(
        payment.client._id.toString()
      );

      const freelancerProfile = freelancerMap.get(
        payment.freelancer._id.toString()
      );

      return {
        ...paymentObj,

        client: {
          _id: payment.client._id,
          username: payment.client.username,
          email: payment.client.email,
          role: payment.client.role,
          companyName: clientProfile?.companyName || null,
          companyLogo: clientProfile?.companyLogo || "",
        },

        freelancer: {
          _id: payment.freelancer._id,
          username: payment.freelancer.username,
          email: payment.freelancer.email,
          role: payment.freelancer.role,
          firstName: freelancerProfile?.firstName || "",
          lastName: freelancerProfile?.lastName || "",
          profilePicture: freelancerProfile?.profilePicture || "",
        },
      };
    });

    res.status(200).json({
      payments: formattedPayments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};

export const getGigPayments = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const isAssignedFreelancer =
      gig.assignedFreelancer &&
      gig.assignedFreelancer.toString() === req.user.id;

    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    const isOwningClient =
      clientProfile && gig.client.toString() === clientProfile._id.toString();

    if (!isAssignedFreelancer && !isOwningClient) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this gig's payments" });
    }

    const payments = await Payment.find({ gig: gigId }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch gig payments" });
  }
};

// ---------- 7. WEBHOOK (Razorpay server-to-server confirmation — belt & suspenders) ----------

export const handleWebhook = async (req, res) => {
  try {

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw buffer — see route setup below
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const orderId = event.payload.payment.entity.order_id;
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      // Only update if our own verifyPayment endpoint hasn't already done so —
      // this webhook exists as a safety net in case the client closed the
      // browser before the frontend could call /verify.

      if (payment && payment.status === "created") {
        payment.razorpayPaymentId = event.payload.payment.entity.id;
        payment.status = "held";
        payment.heldAt = new Date();
        await payment.save();

        const gig = await Gig.findById(payment.gig);
        const milestone = gig.milestones.id(payment.milestone);
        if (milestone && milestone.paymentStatus === "unfunded") {
          milestone.paymentStatus = "funded";
          await gig.save();
        }
      }
    }

    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;
      await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { status: "failed" },
      );
    }    

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
