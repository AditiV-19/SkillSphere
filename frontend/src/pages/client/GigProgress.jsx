import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGigProgress, getGigReviewStatus, getProgressLogs, updateMilestoneDeadline } from "../../services/api";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import SectionCard from "../../components/profile/SectionCard";
import MilestoneList from "../../components/payments/MilestoneList";

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
            <MilestoneList
              gig={gig}
              gigId={gigId}
              isClient={true}
              onUpdate={fetchProgress}
              editingMilestoneId={editingMilestoneId}
              selectedDate={selectedDate}
              updatingId={updatingId}
              setSelectedDate={setSelectedDate}
              setEditingMilestoneId={setEditingMilestoneId}
              handleStartEdit={handleStartEdit}
              handleSaveDeadline={handleSaveDeadline}
            />
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