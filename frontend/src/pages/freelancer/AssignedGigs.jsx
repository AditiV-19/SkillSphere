import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedGigs } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function AssignedGigs() {
  const navigate = useNavigate();
  const [assignedGigs, setAssignedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHiredProjects();
  }, []);

  const fetchHiredProjects = async () => {
    try {
      setLoading(true);
      const res = await getAssignedGigs();
      console.log(res.data.gigs)
      setAssignedGigs(res.data?.gigs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sync active contract workspace.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-slate-500 font-medium">
          Syncing active milestone logs...
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
            Assigned Contracts Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your active milestones, upload task logs, and track payment escrow progress.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        {/* Dynamic Project Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedGigs.map((contract) => {
            // Safe fallback value defaults for tracking metric fields
            const progress = contract.completionPercentage || 0;
            const companyName = contract.client?.companyName || "Verified Client";

            return (
              <div
                key={contract._id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Accent Banner Block based on status */}
                <div className="h-2 w-full bg-blue-600" />

                <div className="p-6 space-y-4 flex-1">
                  {/* Client & Meta Row */}
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {companyName}
                    </p>
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                      <CheckCircle2 size={10} /> Active Contract
                    </span>
                  </div>

                  {/* Title & Description Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1">
                      {contract.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {contract.description}
                    </p>
                  </div>

                  {/* Visual Tracker Component Layer */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-blue-500" /> Completion Rate
                      </span>
                      <span>{progress}%</span>
                    </div>
                    {/* Background track indicator bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric Metadata Grid Block */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100/60">
                      <IndianRupee size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">
                        ₹{contract.budget?.min}–₹{contract.budget?.max}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100/60">
                      <Clock size={13} className="text-blue-600 shrink-0" />
                      <span className="truncate capitalize">
                        {contract.status?.replace("_", " ") || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Workspace Panel Link Trigger */}
                <div className="px-6 pb-6 pt-2">
                  <button
                    onClick={() => navigate(`/freelancer/tracker/${contract._id}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <span>Open Work Tracker</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State Banner Container */}
        {assignedGigs.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-xs max-w-lg mx-auto">
            <FolderGit2 size={40} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No assigned contracts yet</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              When a client accepts your bid parameters from their review panel, the system automatically migrates your contract parameters right here.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}