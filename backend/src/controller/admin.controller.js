import { User } from '../models/user.model.js'
import {Gig} from "../models/gig.model.js";
import { ClientProfile, FreelancerProfile } from '../models/profile.model.js';
import { Payment } from '../models/payment.model.js'

// ---------- USERS ----------

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status === "suspended") filter.isSuspended = true;
    if (status === "active") filter.isSuspended = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(); 

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profileName = null;
        
        if (user.role === "freelancer") {
          const profile = await FreelancerProfile.findOne({ user: user._id })
            .select("firstName lastName")
            .lean();
            
          if (profile) {
            profileName = `${profile.firstName} ${profile.lastName}`;
          }
        } else if (user.role === "client") {
          const profile = await ClientProfile.findOne({ user: user._id })
            .select("companyName")
            .lean();

          if (profile) {
            profileName = `${profile.companyName}`;
          }
        } 
        return {
          ...user,
          name: profileName || user.username
        };
      })
    );

    res.json({ 
      users: usersWithProfiles, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / limit) 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot suspend an admin account" });
    }

    user.isSuspended = true;
    user.suspendedReason = reason || "Violation of platform policy";
    user.suspendedAt = new Date();
    await user.save();

    res.json({ message: "User suspended", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to suspend user" });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = false;
    user.suspendedReason = undefined;
    user.suspendedAt = undefined;
    await user.save();

    res.json({ message: "User reinstated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unsuspend user" });
  }
};

export const verifyFreelancer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "freelancer") {
      return res.status(400).json({ message: "User is not a freelancer" });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    res.json({ message: "Freelancer verified", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify freelancer" });
  }
};

// ---------- GIGS ----------

export const getPendingGigs = async (req, res) => {
  try {
    const {approvalStatus, search} = req.query
    const filter = {}
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    } 
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const gigs = await Gig.find(filter)
      .populate({
        path: "client", 
        select: "companyName user",
        populate: {
          path: "user",
          select: "email"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending gigs" });
  }
};

export const approveGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if(gig.approvalStatus === 'approved') return res.status(400).json({message: "Already Approved!"})

    gig.approvalStatus = 'approved';
    gig.approvedAt = new Date();
    gig.rejectionReason = undefined
    await gig.save();

    res.json({ message: "Gig approved", gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve gig" });
  }
};

export const rejectGig = async (req, res) => {
  try {
    const { reason } = req.body;
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if(gig.approvalStatus === 'rejected') return res.status(400).json({
      message: "Already Rejected!"
    })

    gig.approvalStatus = 'rejected';
    gig.rejectionReason = reason || "Did not meet platform guidelines";
    gig.approvedAt = undefined
    await gig.save();

    res.json({ message: "Gig rejected", gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject gig" });
  }
};

// ---------- PAYMENTS ----------

export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

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

    // Fetch all profiles
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
      message: "Failed to fetch payments",
    });
  }
};

// Simple fraud heuristic: flag freelancers with unusually high volume of
// payments in a short window, or accounts with a spike in 5-star reviews
// from newly created client accounts. Replace/extend with a real model later.
export const getFraudFlags = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const suspiciousPaymentVolume = await Payment.aggregate([
      { $match: { createdAt: { $gte: since }, status: "completed" } },
      { $group: { _id: "$freelancer", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      { $match: { count: { $gte: 5 } } },
      { $sort: { total: -1 } },
    ]);

    const flaggedUsers = await User.find({ _id: { $in: suspiciousPaymentVolume.map((f) => f._id) } })
      .select("name email role");

    const flags = suspiciousPaymentVolume.map((f) => {
      const user = flaggedUsers.find((u) => u._id.equals(f._id));
      return {
        userId: f._id,
        name: user?.name,
        email: user?.email,
        paymentCount24h: f.count,
        totalAmount24h: f.total,
        reason: "High payment volume in last 24 hours",
      };
    });

    res.json({ flags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute fraud flags" });
  }
};

// ---------- ANALYTICS ----------

export const getAnalytics = async (req, res) => {
  try {
    const [platformRevenueAgg] = await Payment.aggregate([
      { $match: { 
        status: {
          $in: ["held", "released", "paid_out"] 
        }}},
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const activeFreelancers = await User.countDocuments({
      role: "freelancer",
      isSuspended: false,
    });

    const topCategories = await Gig.aggregate([
      { $match: { approvalStatus: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const totalGigs = await Gig.countDocuments({ approvalStatus: "approved", status: { $in: ["completed", "cancelled"] } });
    const completedGigs = await Gig.countDocuments({ approvalStatus: "approved", status: "completed" });
    const jobSuccessRate = totalGigs > 0 ? ((completedGigs / totalGigs) * 100).toFixed(1) : 0;
console.log(totalGigs, "vs", completedGigs)

    // last 6 months revenue trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: {$in : ["held", "released", "paid_out"] }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    //Revenue trend

    const now = new Date();

const currentStart = new Date(now);
currentStart.setDate(currentStart.getDate() - 30);

const previousStart = new Date(now);
previousStart.setDate(previousStart.getDate() - 60);

const getRevenue = async (start, end = null) => {
  const dateFilter = end
    ? { $gte: start, $lt: end }
    : { $gte: start };

  const [result] = await Payment.aggregate([
    {
      $match: {
        status: { $in: ["held", "released", "paid_out"] },
        createdAt: dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result?.total || 0;
};

const currentRevenue = await getRevenue(currentStart);
const previousRevenue = await getRevenue(previousStart, currentStart);

let revenueTrend = 0;

if (previousRevenue > 0) {
  revenueTrend = Number(
    (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
  );
} else if (currentRevenue > 0) {
  revenueTrend = 100;
}


    res.json({
      platformRevenue: platformRevenueAgg?.total || 0,
      revenueTrend,
      activeFreelancers,
      topCategories: topCategories.map((c) => ({ category: c._id || "Uncategorized", count: c.count })),
      jobSuccessRate: Number(jobSuccessRate),
      monthlyRevenue: monthlyRevenue.map((m) => ({
        label: `${m._id.month}/${m._id.year}`,
        total: m.total,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
