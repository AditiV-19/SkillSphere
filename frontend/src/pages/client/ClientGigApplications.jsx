import { useState, useEffect } from "react";
import {
  getCompanyApplicationsDeck,
  updateProposalStatus,
} from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  Briefcase,
  IndianRupee,
  Clock,
  ClipboardList,
  Check,
  X,
  MessageSquare,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

export default function ClientGigApplications() {
  const [gigDeck, setGigDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drawer / Overlay Detail States
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    fetchCompanyDataDeck();
  }, []);

  const fetchCompanyDataDeck = async () => {
    try {
      setLoading(true);
      const res = await getCompanyApplicationsDeck();
      setGigDeck(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to parse organization workspace deck.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      await updateProposalStatus(proposalId, newStatus);
      alert(`Proposal status marked as ${newStatus}!`);

      // Update Master State Deck locally smoothly
      setGigDeck((prevDeck) =>
        prevDeck.map((gig) => ({
          ...gig,
          proposals: gig.proposals.map((p) =>
            p._id === proposalId ? { ...p, status: newStatus } : p,
          ),
        })),
      );

      // Also update the currently open detail view drawer state instantly
      if (selectedGig) {
        setSelectedGig((prev) => ({
          ...prev,
          proposals: prev.proposals.map((p) =>
            p._id === proposalId ? { ...p, status: newStatus } : p,
          ),
        }));
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to adjust operational status.",
      );
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-slate-500">
          Syncing organization projects matrix...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Company Applications Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review active applications and proposals distributed across your
            posted project listings.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* 📦 STAGE 1: GIGS CARDS MASTER WORKSPACE INDEX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gigDeck.map((gig) => (
            <div
              key={gig._id}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4 transition hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                      gig.status === "open"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {gig.status}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                    {gig.proposalsCount} Bids Received
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight line-clamp-1">
                  {gig.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {gig.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <span>
                  Budget: ₹{gig.budget?.min} - ₹{gig.budget?.max}
                </span>
                <button
                  onClick={() => setSelectedGig(gig)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition"
                >
                  <span>View Applications</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          ))}

          {gigDeck.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
              <FolderOpen size={40} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">
                No projects found
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Post a project specification contract to begin accumulating
                freelancer proposal applications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 📦 STAGE 2: SLIDE OVER DETAIL VIEW WINDOW */}
      {selectedGig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 transition-all">
          <div className="bg-white w-full max-w-2xl h-screen shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
              <div>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider mb-2"
                >
                  ← Back to Deck Workspace
                </button>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {selectedGig.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluating {selectedGig.proposals.length} live freelancer
                  proposal records
                </p>
              </div>
              <button
                onClick={() => setSelectedGig(null)}
                className="p-1.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl font-bold text-xs border"
              >
                Close
              </button>
            </div>

            {/* Loop through specific applications for this individual project selection */}
            <div className="space-y-4 flex-1">
              {selectedGig.proposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className="border border-slate-200 p-5 rounded-2xl bg-slate-50/40 space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {proposal.freelancerUser
                          ? `${proposal.freelancerUser.firstName} ${proposal.freelancerUser.lastName}`
                          : "Independent Freelancer"}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {proposal.freelancerUser?.email}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border tracking-wide ${
                        proposal.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : proposal.status === "negotiating"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : proposal.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    {proposal.description}
                  </p>

                  <div className="flex gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <IndianRupee size={13} className="text-emerald-600" /> ₹
                      {proposal.bidAmount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={13} className="text-blue-600" />{" "}
                      {proposal.estimatedTime}
                    </span>
                  </div>

                  {/* Operational Controls Flow */}
                  <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100/60">
                    {proposal.status === "pending" ||
                    proposal.status === "negotiating" ? (
                      <>
                        {proposal.status !== "negotiating" && (
                          <button
                            onClick={() =>
                              handleStatusChange(proposal._id, "negotiating")
                            }
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg transition"
                          >
                            <MessageSquare size={12} /> Negotiate
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleStatusChange(proposal._id, "rejected")
                          }
                          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg transition"
                        >
                          <X size={12} /> Reject
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(proposal._id, "accepted")
                          }
                          className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
                        >
                          <Check size={12} /> Accept
                        </button>
                      </>
                    ) : (
                      /* 🚀 Renders a clean non-clickable receipt message instead of a broken button link */
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wide">
                        Decision Finalized
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {selectedGig.proposals.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  No freelancer bids submitted for this specific project
                  outline.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
