import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGigById, submitGigProposal } from "../../services/api.js";
import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import {
  ChevronLeft,
  Briefcase,
  IndianRupee,
  AlertCircle,
  FileText,
  User,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function GigDetails() {
  const { gigId } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 💡 MOCK ROLE CHECK: Replace this with your actual Auth State / Context later
  const [userRole, setUserRole] = useState("freelancer");

  const [isInvited, setIsInvited] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || "";

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    description: "",
    bidAmount: "",
    estimatedTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
    }
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getGigById(gigId);
      const dataPayload = response.data?.gig || response.data;
      const appliedFlag = response.data?.hasApplied || false;

      setGig(dataPayload);
      setHasApplied(appliedFlag);

      if (dataPayload && dataPayload.invitedFreelancers) {
        const hasInvite = dataPayload.invitedFreelancers.includes(user.id);
        setIsInvited(hasInvite);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load project details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitGigProposal(gigId, proposalForm);
      alert("Application sent successfully!");
      setShowApplyForm(false);
      setHasApplied(true); // Soft update UI state locally
      navigate("/freelancer/gig/applications");
    } catch (err) {
      alert(
        err.response?.data?.message || "Application submission broke down.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 font-medium text-sm">
          Fetching contract parameters from server...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !gig) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={32} />
            <h4 className="text-base font-bold text-slate-800">
              Project Error
            </h4>
            <p className="text-slate-500 text-sm mt-1">
              {error || "This project index could not be isolated."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Back Button Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition uppercase tracking-wider mb-6"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        {/* Main Dashboard Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                    gig.status === "open"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {gig.status}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {gig.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Posted on {new Date(gig.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-500" /> Project Description
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {gig.description || "No project description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Metrics and Conditional Control Actions */}
          <div className="space-y-6">
            {/* Financials & Terms Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Budget Parameters
              </h2>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                    Estimated Budget
                  </p>
                  <p className="text-slate-800 font-extrabold text-base">
                    ₹{gig.budget?.min} – ₹{gig.budget?.max}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                    Rate Type
                  </p>
                  <p className="text-slate-700 font-bold text-sm capitalize">
                    {gig.budget?.budgetType || "Fixed Rate"} Contract
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* CONDITIONAL ACTION BUTTONS */}
              <div className="pt-2">
                {userRole === "client" ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/client/gig/${gig._id}/edit`)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                    >
                      Edit Project Spec
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* 🚀 HIDDEN UNTIL APPLIED OPTION BANNER SHIELD */}
                    {hasApplied ? (
                      <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-center py-3 px-4 rounded-xl space-y-1 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide">Application Submitted</p>
                        <p className="text-[10px] text-emerald-600 font-medium leading-normal">
                          You have submitted a proposal for this gig. You can monitor its progression on your applications panel.
                        </p>
                        <button 
                          onClick={() => navigate("/freelancer/gig/applications")}
                          className="mt-2 text-[10px] font-extrabold text-emerald-800 underline block mx-auto hover:text-emerald-950 transition uppercase tracking-wider"
                        >
                          Track Status Feed
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowApplyForm(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <CheckCircle size={14} />{" "}
                          {isInvited ? "Accept & Apply" : "Apply for Gig"}
                        </button>
                        {isInvited && (
                          <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <XCircle size={14} />
                            <span>Decline Offer</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Client Context Details Card */}
            {gig.client && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User size={15} className="text-slate-400" /> About Client
                </h2>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {gig.client.companyName || "Verified Organization"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {gig.client.industry || "Independent Industry Operations"}
                  </p>
                </div>
                {gig.client.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="shrink-0" />
                    <span>
                      {[
                        gig.client.location.address,
                        gig.client.location.city,
                        gig.client.location.state,
                        gig.client.location.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renders safely outside the sidebar button logic block */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <form
            onSubmit={handleProposalSubmit}
            className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-800">
              Submit Your Project Proposal
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Proposal Description
              </label>
              <textarea
                required
                rows={4}
                value={proposalForm.description}
                onChange={(e) =>
                  setProposalForm({
                    ...proposalForm,
                    description: e.target.value,
                  })
                }
                className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500 transition"
                placeholder="Explain your technical strategy..."
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
                  value={proposalForm.bidAmount}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      bidAmount: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2 weeks"
                  value={proposalForm.estimatedTime}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      estimatedTime: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 outline-none p-2.5 rounded-xl text-sm focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Send Proposal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}