import { useEffect, useState } from "react";
import { 
  Check, 
  X, 
  Building2, 
  Mail, 
  IndianRupee, 
  Clock, 
  Loader2,
  CheckCircle2,
  Search, // Added
  Filter  // Added
} from "lucide-react";
import { getPendingGigs, approveGig, rejectGig } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const GigApproval = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State for Search and Filter
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");

  // Refetch when the filter dropdown changes
  useEffect(() => {
    fetchGigs();
  }, [approvalFilter]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      // Pass the search and filter params to your API
      const res = await getPendingGigs({ 
        approvalStatus: approvalFilter || undefined, 
        search: search || undefined 
      });
      setGigs(res.data.gigs);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveGig(id);
      if (approvalFilter === "pending") {
        setGigs((prev) => prev.filter((g) => g._id !== id));
      } else {
        setGigs((prev) => prev.map((g) => 
          g._id === id ? { ...g, approvalStatus: 'approved' } : g
        ));
      }
      alert(res.data.message);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to approve gig"); 
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      const res = await rejectGig(id, reason);

      if (approvalFilter === "pending") {
        setGigs((prev) => prev.filter((g) => g._id !== id));
      } else {
        setGigs((prev) => prev.map((g) => 
          g._id === id ? { ...g, approvalStatus: 'rejected' } : g
        ));
      }
      alert(res.data.message);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to reject gig");
    }
  };

  return (
    <DashboardLayout>
      {/* Header & Controls Area */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between lg:items-end">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Gig Approvals</h2>
          <p className="text-sm text-slate-500 mt-1">Review and manage new gig submissions from clients.</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchGigs()}
              placeholder="Search gig title…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
            />
            <X onClick={(e) => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  title="Clear search" size={18}/>
          </div>

          {/* Approval Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={fetchGigs}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading gigs…</p>
        </div>
      ) : gigs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            {search || approvalFilter ? (
              <Search className="w-8 h-8 text-slate-400" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {search || approvalFilter ? "No gigs found" : "All caught up!"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {search || approvalFilter 
              ? "We couldn't find any gigs matching your current filters." 
              : "There are no gigs currently awaiting approval. New submissions will appear here."}
          </p>
        </div>
      ) : (
        /* Main UI (Your exact list layout) */
        <div className="space-y-4">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row justify-between items-start gap-6 group"
            >
              <div className="flex-1 w-full">
                {/* Header: Title & Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-slate-900 leading-tight">
                    {gig.title}
                  </h4>
                  
                  {gig.approvalStatus === 'approved' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200/60 whitespace-nowrap">
                      <Check className="w-3.5 h-3.5" />
                      Approved
                    </span>
                  ) : gig.approvalStatus === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/60 whitespace-nowrap">
                      <X className="w-3.5 h-3.5" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-4">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={gig.client?.companyName}>
                      {gig.client?.companyName || "Unknown Client"}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate" title={gig.client?.user?.email}>
                      {gig.client?.user?.email || "No email provided"}
                    </span>
                  </div>

                  <div className="flex items-center text-sm font-medium text-slate-700 gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                    {gig.budget?.min?.toLocaleString()} - {gig.budget?.max?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!gig.approvalStatus || gig.approvalStatus === 'pending' ? (
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t border-slate-100 sm:border-t-0 pt-4 sm:pt-0">
                  <button
                    onClick={() => handleApprove(gig._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(gig._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 border border-rose-200/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              ) : (gig.approvalStatus === 'approved') ? (
                <button
                    onClick={() => handleReject(gig._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 border border-rose-200/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
              ) : (
                <button
                    onClick={() => handleApprove(gig._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default GigApproval;