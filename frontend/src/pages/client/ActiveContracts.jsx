import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveGigs } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ArrowUpRight,
  TrendingUp,
  User,
} from "lucide-react";

export default function ActiveContracts() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActiveGigs();
  }, []);

  const fetchActiveGigs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getActiveGigs();
      console.log(res.data.gigs)
      setGigs(res.data?.gigs || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load your active contracts.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-slate-500 font-medium">
          Loading active contracts...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">

        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Active Contracts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gigs currently being worked on by a hired freelancer. Track milestone
            progress for each one.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        {/* Contract Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => {
            const progress = gig.completionPercentage || 0;
            const freelancer = gig.assignedFreelancer;
            const freelancerName = freelancer
              ? `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim()
              : "Unassigned";

            return (
              <div
                key={gig._id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="h-2 w-full bg-blue-600" />

                <div className="p-6 space-y-4 flex-1">
                  {/* Freelancer & status row */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {freelancer?.profilePicture ? (
                          <img
                            src={freelancer.profilePicture}
                            alt={freelancerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={12} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {freelancerName}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border ${
                        gig.status === "completed"
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      <CheckCircle2 size={10} /> {gig.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1">
                    {gig.title}
                  </h3>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-blue-500" /> Completion
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100/60 text-xs font-semibold text-slate-500 w-fit">
                    <IndianRupee size={13} className="text-emerald-600 shrink-0" />
                    <span>
                      {gig.budget?.min}–{gig.budget?.max}
                    </span>
                  </div>
                </div>

                {/* Footer link into GigProgress */}
                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => navigate(`/client/gigs/${gig._id}/progress`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <span>Track Progress</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {gigs.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-xs max-w-lg mx-auto">
            <FolderGit2 size={40} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No active contracts yet</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Once you accept a proposal on one of your gigs, it'll show up here with
              a live progress tracker.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}