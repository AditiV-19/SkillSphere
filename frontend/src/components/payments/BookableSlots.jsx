import { useState } from "react";
import { Clock, Loader2, CalendarX2, CheckCircle2 } from "lucide-react";
import { bookFreelancerSlot, cancelBooking } from "../../services/api";

const formatSlotDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

const formatSlotTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const groupByDate = (slots) => {
  const groups = {};
  slots.forEach((slot) => {
    const key = new Date(slot.startTime).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
  });
  return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
};

/**
 * Renders a freelancer's open, bookable slots for a client to pick from.
 *
 * Props:
 * - freelancerUserId: the freelancer's User._id (required for the booking route)
 * - slots: array of slot objects from profile.availability.slots
 * - onBooked: called after a successful booking, so the parent can refetch the profile
 */
export default function BookableSlots({ freelancerUserId, slots = [], onBooked, onCancelled }) {
  const [bookingId, setBookingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorBySlot, setErrorBySlot] = useState({});

  const isBusy = bookingId !== null || cancellingId !== null;

  // Show open slots to book, plus the client's own booked slots so they can cancel —
  // but never other clients' bookings, since bookedByMe is the only signal we get.
  const relevantUpcomingSlots = slots
    .filter((s) => new Date(s.startTime) >= new Date() && (!s.isBooked || s.bookedByMe))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const grouped = groupByDate(relevantUpcomingSlots);

  const handleBook = async (slot) => {
    try {
      setBookingId(slot._id);
      setErrorBySlot((prev) => ({ ...prev, [slot._id]: null }));

      await bookFreelancerSlot(freelancerUserId, slot._id);
      onBooked?.();
    } catch (err) {
      console.error(err);
      // 409 means someone else grabbed it a moment before we did — surface that clearly
      const message =
        err.response?.status === 409
          ? "This slot was just booked by someone else. Pick another time."
          : err.response?.data?.message || "Could not book this slot. Try again.";
      setErrorBySlot((prev) => ({ ...prev, [slot._id]: message }));
    } finally {
      setBookingId(null);
    }
  };

  const handleCancel = async (slot) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      setCancellingId(slot._id);
      setErrorBySlot((prev) => ({ ...prev, [slot._id]: null }));

      await cancelBooking(freelancerUserId, slot._id);
      onCancelled?.();
      onBooked?.(); // reuse the same refetch — either callback is fine to pass, both trigger a refresh
    } catch (err) {
      console.error(err);
      setErrorBySlot((prev) => ({
        ...prev,
        [slot._id]: err.response?.data?.message || "Could not cancel this booking.",
      }));
    } finally {
      setCancellingId(null);
    }
  };

  if (grouped.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarX2 size={24} className="text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400 font-medium italic">
          No open consultation slots or bookings right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([dateKey, daySlots]) => (
        <div key={dateKey}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {formatSlotDate(dateKey)}
          </p>
          <div className="space-y-2">
            {daySlots.map((slot) => {
              const isBooking = bookingId === slot._id;
              const isCancelling = cancellingId === slot._id;
              const slotError = errorBySlot[slot._id];

              return (
                <div key={slot._id}>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs transition hover:bg-slate-100/50">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <Clock size={13} className="text-slate-400" />
                      {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                      {slot.bookedByMe && (
                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} />
                          Booked by you
                        </span>
                      )}
                    </div>

                    {slot.bookedByMe ? (
                      <button
                        onClick={() => handleCancel(slot)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Cancelling…
                          </>
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(slot)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Booking…
                          </>
                        ) : (
                          "Book Now"
                        )}
                      </button>
                    )}
                  </div>
                  {slotError && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1 px-1">{slotError}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}