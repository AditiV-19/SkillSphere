import { FreelancerProfile, ClientProfile } from "../models/profile.model.js";
import { sendNotification } from "../services/notification.services.js";

// ---------- 1. FREELANCER: ADD SLOTS ----------

export const addAvailabilitySlots = async (req, res) => {
  try {
    const { slots } = req.body; // [{ startTime, endTime }, ...] — full ISO datetimes

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "Provide at least one slot" });
    }

    const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!freelancerProfile) {
      return res.status(404).json({ message: "Freelancer profile not found" });
    }

    // Reject overlaps against existing slots (booked or not — a freelancer
    // shouldn't be able to double-book their own calendar)
    for (const newSlot of slots) {
      const newStart = new Date(newSlot.startTime);
      const newEnd = new Date(newSlot.endTime);

      if (newEnd <= newStart) {
        return res.status(400).json({ message: "endTime must be after startTime" });
      }

      const clash = freelancerProfile.availability.slots.find((s) => {
        return newStart < s.endTime && s.startTime < newEnd;
      });

      if (clash) {
        return res.status(400).json({
          message: `Slot ${newStart.toLocaleString()} overlaps with an existing slot`,
        });
      }
    }

    freelancerProfile.availability.slots.push(
      ...slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime, isBooked: false }))
    );
    await freelancerProfile.save();

    res.status(201).json({
      message: "Availability slots added",
      slots: freelancerProfile.availability.slots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add availability slots" });
  }
};

// ---------- 2. CLIENT: BOOK A SLOT (automatic scheduling) ----------

export const bookFreelancerSlot = async (req, res) => {
  try {
    const { freelancerUserId, slotId } = req.params;

    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    if (!clientProfile) {
      return res.status(403).json({ message: "Only clients can book slots" });
    }

    // Atomic — the query only matches (and thus only updates) if the slot
    // is still isBooked:false at write time. Two clients racing for the
    // same slot: the second write matches nothing and gets null back.
    const freelancerProfile = await FreelancerProfile.findOneAndUpdate(
      {
        user: freelancerUserId,
        "availability.slots": {
          $elemMatch: { _id: slotId, isBooked: false },
        },
      },
      {
        $set: {
          "availability.slots.$.isBooked": true,
          "availability.slots.$.bookedBy": clientProfile._id,
        },
      },
      { returnDocument: 'after' }
    );

    if (!freelancerProfile) {
      return res.status(409).json({
        message: "This slot is no longer available — please pick another",
      });
    }

    const slot = freelancerProfile.availability.slots.id(slotId);

    await sendNotification({
      recipient: freelancerUserId,
      sender: req.user.id,
      type: "BOOKING",
      title: "New Consultation Booked",
      message: `A client booked your slot on ${new Date(slot.startTime).toLocaleString()}`,
      link: `/freelancer/schedule`,
    });

    res.json({ message: "Slot booked successfully", slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to book slot" });
  }
};

// ---------- 3. CANCEL A BOOKING ----------

export const cancelBooking = async (req, res) => {
  try {
    const { freelancerUserId, slotId } = req.params;

    const freelancerProfile = await FreelancerProfile.findOne({ user: freelancerUserId });
    if (!freelancerProfile) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const slot = freelancerProfile.availability.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    const isOwningFreelancer = freelancerUserId === req.user.id;

    const clientProfile = await ClientProfile.findOne({ user: req.user.id });
    const isBookingClient =
      clientProfile && slot.bookedBy?.toString() === clientProfile._id.toString();

    if (!isOwningFreelancer && !isBookingClient) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (!slot.isBooked) {
      return res.status(400).json({ message: "This slot isn't booked" });
    }

    const notifyUserId = isOwningFreelancer ? slot.bookedBy : freelancerUserId;

    slot.isBooked = false;
    slot.bookedBy = null;
    await freelancerProfile.save();

    if (notifyUserId) {
      await sendNotification({
        recipient: isOwningFreelancer ? clientProfile?.user : freelancerUserId,
        sender: req.user.id,
        type: "BOOKING",
        title: "Booking Cancelled",
        message: `The consultation on ${new Date(slot.startTime).toLocaleString()} was cancelled`,
        link: `/schedule`,
      });
    }

    res.json({ message: "Booking cancelled", slot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// ---------- 4. FREELANCER: VIEW OWN SCHEDULE ----------

export const getMySchedule = async (req, res) => {
  try {
    const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id })
      .select("availability")
      .populate({
        path: "availability.slots.bookedBy",
        select: "companyName",
      });
    res.json({ slots: freelancerProfile?.availability?.slots || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
};

// ---------- FREELANCER: CANCEL OWN SLOT (self-service, no freelancerUserId needed) ----------

export const cancelMySlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const freelancerProfile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!freelancerProfile) {
      return res.status(404).json({ message: "Freelancer profile not found" });
    }
    const slot = freelancerProfile.availability.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    console.log("SLOT: ", slot )

    const wasBooked = slot.isBooked;
    const clientId = slot.bookedBy;
    const startTime = slot.startTime;

    if(wasBooked){
      slot.isBooked = false;
      slot.bookedBy = null;
    } else{
      freelancerProfile.availability.slots.pull(slotId);
    }

    const response = await freelancerProfile.save();

    if (wasBooked && clientId) {
      const clientProfile = await ClientProfile.findById(clientId);

      if (clientProfile) {

        await sendNotification({
          recipient: clientProfile.user,
          sender: req.user.id,
          type: "BOOKING",
          title: "Booking Cancelled",
          message: `Your consultation on ${new Date(slot.startTime).toLocaleString()} was cancelled by the freelancer`,
          link: `/client/browse`,
        });
      }
    }

    res.json({ message: wasBooked ? "Booking cancelled, slot is now open" : "Slot removed", slot: wasBooked ? slot : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update slot" });
  }
};