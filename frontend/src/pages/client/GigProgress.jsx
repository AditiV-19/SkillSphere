import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Added updateMilestoneDeadline (or replace with your generic updateGig route)
import { getGigProgress, getGigReviewStatus, getProgressLogs, updateMilestoneDeadline } from "../../services/api";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SectionCard from "../../components/profile/SectionCard";

import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Paperclip,
  MessageSquare,
  Calendar,
  Save,
  X,
  Loader2,
} from "lucide-react";
import SubmitReviewForm from "../../components/SubmitReviewForm";

const statusStyles = {
  completed: { dot: "bg-emerald-600", label: "bg-emerald-50 text-emerald-700" },
  in_progress: { dot: "bg-blue-600", label: "bg-blue-50 text-blue-700" },
  pending: { dot: "bg-slate-300", label: "bg-slate-100 text-slate-500" },
};

const getDeadlineBadge = (dueDate, status) => {
  if (status === "completed") return null;

  if (!dueDate) {
    return {
      text: "No deadline set",
      className: "bg-slate-50 text-slate-400 border-slate-200",
    };
  }

  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)}d`,
      className: "bg-rose-50 text-rose-700 border-rose-100",
    };
  }
  if (diffDays <= 3) {
    return {
      text: diffDays === 0 ? "Due today" : `Due in ${diffDays}d`,
      className: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }
  return {
    text: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  };
};

const formatLogDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function ProgressLogFeed({ logs }) {
  if (!logs?.length) {
    return (
      <p className="text-sm text-slate-400">No progress updates posted yet.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {logs.map((log) => (
        <li key={log._id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
            {log.author?.profilePicture ? (
              <img
                src={log.author.profilePicture}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <MessageSquare className="w-4 h-4 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900">
                {log.author?.firstName} {log.author?.lastName}
              </p>
              <p className="text-xs text-slate-400">{formatLogDate(log.createdAt)}</p>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{log.message}</p>
            {log.fileUrl && (
              <a
                href={log.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline mt-1.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                {log.fileName || "Attached file"}
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function GigProgress() {
  const { gigId } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasReviewed, setHasReviewed] = useState(false);
  // Managing local editing states for deadlines
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, [gigId]);

  const fetchProgress = async () => {
  try {
    setLoading(true);
    setError("");

    const [progressRes, logsRes, reviewRes] = await Promise.all([
      getGigProgress(gigId),
      getProgressLogs(gigId),
      getGigReviewStatus(gigId), // add this API
    ]);

    setGig(progressRes.data.gig);
    setLogs(logsRes.data.logs || []);
    setHasReviewed(reviewRes.data.hasReviewed);
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to load progress.");
  } finally {
    setLoading(false);
  }
};

  const handleStartEdit = (milestone) => {
    setEditingMilestoneId(milestone._id);
    // Format existing date to YYYY-MM-DD for standard input element compatibility
    if (milestone.dueDate) {
      setSelectedDate(new Date(milestone.dueDate).toISOString().split("T")[0]);
    } else {
      setSelectedDate("");
    }
  };

  const handleSaveDeadline = async (milestoneId) => {
    try {
      setUpdatingId(milestoneId);
      
      // Hit backend update route
      await updateMilestoneDeadline(gigId, milestoneId, selectedDate || null );
      
      // Update local state smoothly on success
      setGig((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m._id === milestoneId ? { ...m, dueDate: selectedDate ? new Date(selectedDate).toISOString() : null } : m
        ),
      }));
      
      setEditingMilestoneId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save deadline change.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 text-sm font-medium">
          Loading progress...
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
          <span>Back</span>
        </button>

        {/* Header + completion bar */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{gig.title}</h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
              {gig.status.replace("_", " ")}
            </span>
          </div>
          {gig.assignedFreelancer && (
            <p className="text-sm text-slate-500">
              Assigned to {gig.assignedFreelancer.firstName} {gig.assignedFreelancer.lastName}
            </p>
          )}

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

        {/* Milestone timeline */}
        <SectionCard title="Milestones">
          {gig.milestones?.length ? (
            <ul className="relative border-l border-blue-200 ml-2 space-y-6">
              {gig.milestones.map((m) => {
                const style = statusStyles[m.status] || statusStyles.pending;
                const badge = getDeadlineBadge(m.dueDate, m.status);
                const isEditing = editingMilestoneId === m._id;
                const isWorking = updatingId === m._id;

                return (
                  <li key={m._id} className="relative pl-6">
                    {/* Fixed absolute left layout bug for timeline line alignment */}
                    <span
                      className={`absolute left-[6.5px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${style.dot}`}
                    />
                    
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1 flex-1 min-w-60">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">{m.title}</h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${style.label}`}
                          >
                            {m.status.replace("_", " ")}
                          </span>
                          
                          {!isEditing && badge && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </div>
                        
                        {m.description && (
                          <p className="text-sm text-slate-600">{m.description}</p>
                        )}
                        
                        {/* Interactive or static Date block */}
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200 max-w-xs">
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              disabled={isWorking}
                              className="bg-transparent text-sm text-slate-800 outline-none w-full cursor-pointer"
                            />
                            <button
                              onClick={() => handleSaveDeadline(m._id)}
                              disabled={isWorking}
                              className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded transition"
                              title="Save deadline"
                            >
                              {isWorking ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            </button>
                            <button
                              onClick={() => setEditingMilestoneId(null)}
                              disabled={isWorking}
                              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="font-medium text-slate-600">₹{m.amount}</span>
                            {m.dueDate ? (
                              <>
                                <span>·</span>
                                <span>due {new Date(m.dueDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}</span>
                              </>
                            ) : (
                              <>
                                <span>·</span>
                                <span className="italic text-slate-400">No date set</span>
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Timeline Actions: Edit date controls accessible to client */}
                      {m.status !== "completed" && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 py-1 px-2 hover:bg-slate-50 rounded-lg transition shrink-0"
                        >
                          <Calendar size={14} />
                          <span>{m.dueDate ? "Change date" : "Set deadline"}</span>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No milestones defined for this gig yet.</p>
          )}
        </SectionCard>

        {/* Progress log feed — read-only for the client */}
        <div className="mt-6">
          <SectionCard title="Progress Updates">
            <ProgressLogFeed logs={logs} />
          </SectionCard>
          {/* Module 8 — Smart Reputation & Review System (Client Reviewing Freelancer) */}
{gig.status === "completed" && (
  <div className="mt-6">
    <SectionCard title="Rate the Freelancer">
      <SubmitReviewForm
        projectId={gig._id}
        revieweeId={gig.assignedFreelancer._id || gig.assignedFreelancer}
        revieweeName={`${gig.assignedFreelancer.firstName} ${gig.assignedFreelancer.lastName}`}
        onReviewed={() => setHasReviewed(true)}
        hasReviewed = {hasReviewed}
      />
    </SectionCard>
  </div>
)}
        </div>
      </div>
    </DashboardLayout>
  );
}