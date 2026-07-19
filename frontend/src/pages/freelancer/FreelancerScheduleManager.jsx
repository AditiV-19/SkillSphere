import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, X, Loader2, CalendarX2, User } from "lucide-react";
import {
  addAvailabilitySlots,
  getMySchedule,
  cancelMySlot,
} from "../../services/api";

// ---------- helpers ----------

const toLocalDatetimeInputValue = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

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
  return Object.entries(groups).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );
};

// ---------- add-slot form ----------

function AddSlotForm({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStartTime("");
    setEndTime("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError("Pick both a start and end time");
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await addAvailabilitySlots([
        {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
      ]);
      reset();
      setOpen(false);
      onAdded?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not add this slot");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
      >
        <Plus size={14} />
        Add slot
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">New slot</p>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-500">Starts</span>
          <input
            type="datetime-local"
            value={startTime}
            min={toLocalDatetimeInputValue(new Date())}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={saving}
            className="mt-1 w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-slate-500">Ends</span>
          <input
            type="datetime-local"
            value={endTime}
            min={startTime || toLocalDatetimeInputValue(new Date())}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={saving}
            className="mt-1 w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          />
        </label>
      </div>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {saving ? "Adding…" : "Add to calendar"}
      </button>
    </form>
  );
}

// ---------- main component ----------

export default function FreelancerScheduleManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getMySchedule();
      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load your schedule.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (slot) => {
    const confirmMsg = slot.isBooked
      ? "This slot is booked. Cancel and notify the client?"
      : "Remove this open slot from your calendar?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setCancellingId(slot._id);
      await cancelMySlot(slot._id);
      await fetchSchedule();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not update this slot.");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = slots
    .filter((s) => new Date(s.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const grouped = groupByDate(upcoming);

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            My Availability
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Slots clients can book directly onto your calendar
          </p>
        </div>
        <AddSlotForm onAdded={fetchSchedule} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading your schedule…
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-rose-500 text-center py-6">{error}</p>
      )}

      {!loading && !error && grouped.length === 0 && (
        <div className="text-center py-10">
          <CalendarX2 size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            No upcoming slots. Add one so clients can book time with you.
          </p>
        </div>
      )}

      {!loading && !error && grouped.length > 0 && (
        <div className="space-y-5 mt-2">
          {grouped.map(([dateKey, daySlots]) => (
            <div key={dateKey}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {formatSlotDate(dateKey)}
              </p>
              <div className="space-y-2">
                {daySlots.map((slot) => {
                  const isCancelling = cancellingId === slot._id;
                  return (
                    <div
                      key={slot._id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">
                          {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                        </span>

                        {slot.isBooked ? (
                          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <User size={10} />
                            {slot.bookedBy?.companyName || "Booked"}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Open
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleCancel(slot)}
                        disabled={isCancelling}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : slot.isBooked ? (
                          "Cancel booking"
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}