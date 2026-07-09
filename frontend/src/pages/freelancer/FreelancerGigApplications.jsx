import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFreelancerApplications,
  updateFreelancerProposal,
} from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Briefcase,
  IndianRupee,
  Clock,
  ExternalLink,
  Inbox,
  AlertCircle,
  Edit2,
} from "lucide-react";

const getStatusTimelineDetails = (status) => {
  switch (status) {
    case "accepted":
      return {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pillColor: "bg-emerald-500",
        title: "Proposal Accepted! 🎉",
        description:
          "The client approved your terms. Head over to your dashboard milestones to start collaboration.",
      };
    case "negotiating":
      return {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        pillColor: "bg-amber-500",
        title: "Terms Under Negotiation 💬",
        description:
          "The client wants to discuss your pricing or timeline terms. Keep an eye on your message channel.",
      };
    case "rejected":
      return {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        pillColor: "bg-rose-500",
        title: "Application Closed",
        description:
          "The client decided to move forward with another freelancer for this specific project outline.",
      };
    case "pending":
    default:
      return {
        color: "bg-slate-50 text-slate-600 border-slate-200",
        pillColor: "bg-slate-400",
        title: "Pending Client Review ⏳",
        description:
          "Your proposal is sitting inside the client's inbox feed. They haven't made a status decision yet.",
      };
  }
};

export default function FreelancerGigApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal States
  const [showEditForm, setShowEditForm] = useState(false);
  const [targetProposalId, setTargetProposalId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: "",
    bidAmount: "",
    estimatedTime: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const res = await getFreelancerApplications();
      setApplications(res.data?.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (app) => {
    setTargetProposalId(app._id);
    setEditForm({
      description: app.description,
      bidAmount: app.bidAmount,
      estimatedTime: app.estimatedTime,
    });
    setShowEditForm(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateFreelancerProposal(targetProposalId, editForm);
      alert("Proposal updated successfully!");
      setShowEditForm(false);

      // Update local state state fully instead of forcing page re-fetch
      setApplications((prev) =>
        prev.map((app) =>
          app._id === targetProposalId ? { ...app, ...editForm } : app,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update proposal.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-slate-500">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your active project pitches.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app) => {
            const statusConfig = getStatusTimelineDetails(app.status);

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5 transition-all hover:shadow-md"
              >
                {/* Top Header Row */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {app.gig?.title || "Archived Project Reference"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Filed on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Simplified Active Tag */}
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${statusConfig.color}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusConfig.pillColor}`}
                    ></span>
                    <span>{app.status}</span>
                  </div>
                </div>

                {/* LIVE PROPOSAL STATUS TRACKER TIMELINE ALERT */}
                <div
                  className={`border p-4 rounded-xl space-y-1 ${statusConfig.color}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    {statusConfig.title}
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                    {statusConfig.description}
                  </p>
                </div>

                {/* Proposal Pitch Text Cover Block */}
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Your Submitted Pitch
                  </p>
                  <p className="text-slate-600 text-sm bg-slate-50/60 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                    {app.description}
                  </p>
                </div>

                {/* Bottom Layout Row Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <IndianRupee size={13} className="text-emerald-600" />{" "}
                      Bid: ₹{app.bidAmount}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock size={13} className="text-blue-600" /> Timeframe:{" "}
                      {app.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {app.status === "pending" && (
                      <button
                        onClick={() => openEditModal(app)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-0.5"
                      >
                        <Edit2 size={13} /> Edit Bid
                      </button>
                    )}
                    {app.gig && (
                      <button
                        onClick={() => navigate(`/freelancer/gig/${app.gig._id}`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
                      >
                        <span>View Project Spec</span>{" "}
                        <ExternalLink size={14} />{" "}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {applications.length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
              <Inbox size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No active applications</h4>
              <p className="text-xs text-slate-400 mt-1">When you apply to gigs, your active bids will show up right here.</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROPOSAL MODAL OVERLAY */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleUpdateSubmit}
            className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-800">
              Update Your Proposal
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Proposal Description
              </label>
              <textarea
                required
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Bid Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editForm.bidAmount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bidAmount: e.target.value })
                  }
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  required
                  value={editForm.estimatedTime}
                  onChange={(e) =>
                    setEditForm({ ...editForm, estimatedTime: e.target.value })
                  }
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="w-1/2 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}