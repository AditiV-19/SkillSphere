import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFreelancerApplications, updateFreelancerProposal } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Briefcase, IndianRupee, Clock, ExternalLink, Inbox, AlertCircle, Edit2 } from "lucide-react";

export default function FreelancerApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Modal States
  const [showEditForm, setShowEditForm] = useState(false);
  const [targetProposalId, setTargetProposalId] = useState(null);
  const [editForm, setEditForm] = useState({ description: "", bidAmount: "", estimatedTime: "" });
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
      estimatedTime: app.estimatedTime
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
      setApplications(prev => 
        prev.map(app => app._id === targetProposalId ? { ...app, ...editForm } : app)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update proposal.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-sm text-slate-500">Loading dashboard...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Job Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage your active project pitches.</p>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{app.gig?.title || "Archived Project"}</h3>
                  <p className="text-xs text-slate-400">Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${
                  app.status === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  app.status === "negotiating" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  app.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-200"
                }`}>{app.status}</span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Your Pitch</p>
                <p className="text-slate-600 text-sm bg-slate-50/60 p-3 rounded-xl border border-slate-100 leading-relaxed">{app.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <IndianRupee size={13} className="text-emerald-600" /> Bid: ₹{app.bidAmount}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock size={13} className="text-blue-600" /> Duration: {app.estimatedTime}
                  </span>
                </div>

                <div className="flex items-center gap-5 self-end sm:self-auto">
                  {/* 🚀 EDIT BUTTON: Only visible if the status is still "pending" */}
                  {app.status === "pending" && (
                    <button 
                      onClick={() => openEditModal(app)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Edit2 size={13} /> Edit Bid
                    </button>
                  )}
                  {app.gig && (
                    <button onClick={() => navigate(`/freelancer/gig/${app.gig._id}`)} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                      <span>View Project Spec</span> <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 EDIT PROPOSAL MODAL OVERLAY */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateSubmit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Update Your Proposal</h3>
            
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Proposal Description</label>
              <textarea 
                required rows={4} value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Bid Amount (₹)</label>
                <input 
                  type="number" required value={editForm.bidAmount}
                  onChange={(e) => setEditForm({...editForm, bidAmount: e.target.value})}
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Estimated Duration</label>
                <input 
                  type="text" required value={editForm.estimatedTime}
                  onChange={(e) => setEditForm({...editForm, estimatedTime: e.target.value})}
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowEditForm(false)} className="w-1/2 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-xs">Cancel</button>
              <button type="submit" disabled={updating} className="w-1/2 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm">{updating ? "Updating..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}