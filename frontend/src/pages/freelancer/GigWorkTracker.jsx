import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGigProgress,
  updateMilestoneStatus,
  getProgressLogs,
  addProgressLog,
  uploadProjectFile,
  getGigReviewStatus, // 💡 Imported optimized review status endpoint
} from "../../services/api";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SectionCard from "../../components/profile/SectionCard";
import SubmitReviewForm from "../../components/SubmitReviewForm";

import {
  ChevronLeft,
  AlertCircle,
  Paperclip,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

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

// Module 14 — Progress Composer (Cleaned from nested accidental code)
function ProgressLogComposer({ gigId, onPosted, hasReviewed }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setPosting(true);
      let fileUrl = "";
      let fileName = "";

      if (file) {
        const uploadRes = await uploadProjectFile(file);
        fileUrl = uploadRes.data.url;
        fileName = file.name;
      }

      const res = await addProgressLog(gigId, {
        message: message.trim(),
        fileUrl,
        fileName,
      });
      onPosted(res.data.log);
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post update.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
    {!hasReviewed && (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Post a progress update for the client..."
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex items-center justify-between gap-2">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded-lg border border-slate-200"
          >
            <Paperclip className="w-3.5 h-3.5" />
            {file ? file.name : "Attach file"}
          </button>
          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="ml-1.5 text-slate-400 hover:text-rose-500 align-middle"
            >
              <X className="w-3.5 h-3.5 inline" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={posting || !message.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          {posting ? "Posting..." : "Post Update"}
        </button>
      </div>
    </form>
    )}
    </>
  );
}

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
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">
              {formatLogDate(log.createdAt)}
            </p>
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

function MilestoneStatusControl({ gigId, milestone, onUpdated, hasReviewed }) {
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
    <>
      {!hasReviewed && (
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
      )}
    </>
  );
}

export default function GigWorkTracker() {
  const { gigId } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasReviewed, setHasReviewed] = useState(false); // 💡 State correctly instantiated here

  useEffect(() => {
    fetchProgress();
  }, [gigId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");

      // Centralized parallel fetching logic includes optimized check status route
      const [progressRes, logsRes, reviewRes] = await Promise.all([
        getGigProgress(gigId),
        getProgressLogs(gigId),
        getGigReviewStatus(gigId),
      ]);

      setGig(progressRes.data.gig);
      setLogs(logsRes.data.logs || []);
      setHasReviewed(!!reviewRes.data.hasReviewed);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load this contract.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogPosted = (newLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleMilestoneUpdate = (milestoneId, newStatus) => {
    setGig((prev) => {
      const milestones = prev.milestones.map((m) =>
        m._id === milestoneId ? { ...m, status: newStatus } : m,
      );
      const total = milestones.length;
      const completed = milestones.filter(
        (m) => m.status === "completed",
      ).length;
      return {
        ...prev,
        milestones,
        completionPercentage: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  const getClientRevieweeId = () => {
    if (!gig?.client) return "";
    return (
      gig.client.user?._id || gig.client.user || gig.client._id || gig.client
    );
  };

  const getClientRevieweeName = () => {
    if (!gig?.client) return "Project Client";
    if (gig.client.companyName) return gig.client.companyName;
    if (gig.client.contactPerson?.name) return gig.client.contactPerson.name;
    return "Project Client";
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
              <span className="font-medium text-slate-700">
                Overall completion
              </span>
              <span className="font-bold text-blue-700">
                {gig.completionPercentage}%
              </span>
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
            <ul className="relative border-l border-blue-200 ml-2 space-y-6">
              {gig.milestones.map((m) => {
                const style = statusStyles[m.status] || statusStyles.pending;
                const badge = getDeadlineBadge(m.dueDate, m.status);
                return (
                  <li key={m._id} className="relative pl-6">
                    <span
                      className={`absolute left-[6.5px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${style.dot}`}
                    />
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">
                          {m.title}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${style.label}`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                        {badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
                          >
                            {badge.text}
                          </span>
                        )}
                      </div>
                      <MilestoneStatusControl
                        gigId={gig._id}
                        milestone={m}
                        onUpdated={handleMilestoneUpdate}
                        hasReviewed={hasReviewed}
                      />
                    </div>
                    {m.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {m.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      ₹{m.amount}
                      {m.dueDate &&
                        ` · due ${new Date(m.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              No milestones defined for this gig yet.
            </p>
          )}
        </SectionCard>

        {/* Progress log — freelancer can post updates + attach files */}
        <div className="mt-6">
          <SectionCard title="Progress Updates">
            <ProgressLogComposer
              gigId={gig._id}
              onPosted={handleLogPosted}
              hasReviewed={hasReviewed}
            />
            <ProgressLogFeed logs={logs} />
          </SectionCard>

          {/* Module 8 — Smart Reputation & Review System (Freelancer Reviewing Client) */}
          {gig.status === "completed" && gig.client && (
            <div className="mt-6">
              <SectionCard title="Rate the Client">
                <SubmitReviewForm
                  projectId={gig._id}
                  revieweeId={getClientRevieweeId()}
                  revieweeName={getClientRevieweeName()}
                  hasReviewed={hasReviewed}
                  onReviewSubmitted={() => setHasReviewed(true)}
                />
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
