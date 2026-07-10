import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGigProgress, updateMilestoneStatus } from "../../services/api";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SectionCard from "../../components/profile/SectionCard";

import { ChevronLeft, AlertCircle } from "lucide-react";

const statusStyles = {
  completed: { dot: "bg-emerald-600", label: "bg-emerald-50 text-emerald-700" },
  in_progress: { dot: "bg-blue-600", label: "bg-blue-50 text-blue-700" },
  pending: { dot: "bg-slate-300", label: "bg-slate-100 text-slate-500" },
};

function MilestoneStatusControl({ gigId, milestone, onUpdated }) {
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdating(true);
      await updateMilestoneStatus(gigId, milestone._id, newStatus);
      onUpdated(milestone._id, newStatus);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update milestone.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={milestone.status}
      onChange={handleChange}
      disabled={updating}
      className="text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1 disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}

export default function GigWorkTracker() {
  const { gigId } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, [gigId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getGigProgress(gigId);
      setGig(res.data.gig);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load this contract.");
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneUpdate = (milestoneId, newStatus) => {
    setGig((prev) => {
      const milestones = prev.milestones.map((m) =>
        m._id === milestoneId ? { ...m, status: newStatus } : m,
      );
      const total = milestones.length;
      const completed = milestones.filter((m) => m.status === "completed").length;
      return {
        ...prev,
        milestones,
        completionPercentage: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading work tracker...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !gig) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={28} />
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition mb-6 uppercase tracking-wider"
        >
          <ChevronLeft size={16} />
          <span>Back to contracts</span>
        </button>

        {/* Header + completion bar */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{gig.title}</h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
              {gig.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Overall completion</span>
              <span className="font-bold text-blue-700">{gig.completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${gig.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Editable milestone list */}
        <SectionCard title="Milestones">
          {gig.milestones?.length ? (
            <ul className="relative border-l-2 border-blue-200 ml-1.5">
              {gig.milestones.map((m, i) => {
                const style = statusStyles[m.status] || statusStyles.pending;
                return (
                  <li
                    key={m._id}
                    className={`relative pl-6 ${i !== gig.milestones.length - 1 ? "pb-8" : ""}`}
                  >
                    <span
                      className={`absolute -left-1.75 top-1 w-3 h-3 rounded-full ring-4 ring-white ${style.dot}`}
                    />
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{m.title}</h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${style.label}`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      </div>
                      HOOOOOOOOOOOO
                      <MilestoneStatusControl
                        gigId={gig._id}
                        milestone={m}
                        onUpdated={handleMilestoneUpdate}
                      />
                    </div>
                    {m.description && (
                      <p className="text-sm text-slate-600 mt-1">{m.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      ${m.amount}
                      {m.dueDate &&
                        ` · due ${new Date(m.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No milestones defined for this gig yet.</p>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}