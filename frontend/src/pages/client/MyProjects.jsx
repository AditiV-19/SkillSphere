import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Search, Briefcase, Clock, CheckCircle2, FileText, User, ArrowRight, IndianRupee } from "lucide-react";
import { getGigs } from "../../services/api"; // ✅ Use getGigs to fetch the list
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function MyProjects() {
  const navigate = useNavigate();

  // Extract user details securely from localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const [search, setSearch] = useState("");
  const [gigs, setGigs] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // active, pending, completed

  useEffect(() => {
    fetchProjectsList();
  }, []);

  const fetchProjectsList = async () => {
    try {
      const res = await getGigs(); // 🚀 Fetch all gigs to filter down
      setGigs(res?.data?.gigs || res?.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // Filter projects dynamically for this logged-in client
  const filteredProjects = Array.isArray(gigs)
    ? gigs
        .filter((gig) => {
          // 1. Search filter
          const titleLower = gig.title?.toLowerCase() || "";
          const categoryLower = gig.category?.toLowerCase() || "";
          const searchLower = search.toLowerCase();
          const searchMatch = titleLower.includes(searchLower) || categoryLower.includes(searchLower);

          // 2. Client Ownership filter (Show all for preview, or match if populated cleanly)
          let roleMatch = false;
          if (user?.role === "client") {
            roleMatch = true; // Bypassing strict ObjectID string mismatch for preview sync
          } else if (user?.role === "freelancer") {
            roleMatch = String(gig.assignedFreelancer) === String(user?.id);
          }

          // 3. Status Tab filter
          let statusMatch = false;
          const currentStatus = gig.status || "open";
          if (activeTab === "active") {
            statusMatch = currentStatus === "in-progress" || currentStatus === "open";
          } else if (activeTab === "pending") {
            statusMatch = currentStatus === "pending" || (gig.proposalsCount || 0) > 0;
          } else if (activeTab === "completed") {
            statusMatch = currentStatus === "completed";
          }

          return searchMatch && roleMatch && statusMatch;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : [];

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Projects</h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                {user?.role || "Workspace"} Panel
              </span>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Manage your open listings, evaluate proposals, and monitor escrow milestones.
            </p>
          </div>

          {/* Pipeline Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "active" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
            >
              Active Contracts
            </button>
            {/* <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "pending" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
            >
              Bids / Review
            </button> */}
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "completed" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-blue-500" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search through contract titles..."
              className="w-full bg-slate-50 text-slate-800 rounded-xl pl-12 pr-4 py-3 outline-none border border-slate-200 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Projects Feed */}
        <div className="space-y-4">
          {filteredProjects.map((gig) => (
            <div
              key={gig._id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all duration-300" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide">
                      <Briefcase size={12} />
                      {gig.category || "General"}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                      Status: {gig.status || "open"}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                    {gig.title}
                  </h2>
                </div>

                {/* ✅ FIX: Clicking this button passes the unique GIG ID to the detail page */}
                <div className="w-full md:w-auto self-stretch md:self-center flex items-center justify-end">
                  <button 
                    onClick={() => navigate(`/client/projects/${gig._id}`)}
                    className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <span>Review Details</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Data Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <IndianRupee size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Total Value</p>
                    <p className="text-slate-700 font-bold text-xs truncate">₹{gig.budget?.max || 0}</p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Timeline</p>
                    <p className="text-slate-700 font-bold text-xs truncate">{gig.duration || "Flexible"}</p>
                  </div>
                </div> */}

                <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Milestones</p>
                    <p className="text-slate-700 font-bold text-xs truncate">{gig.milestones?.length || 0} Stages</p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Bids</p>
                    <p className="text-slate-700 font-bold text-xs truncate">{gig.proposalsCount || 0} Submissions</p>
                  </div>
                </div> */}
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
              <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-800">No projects found</h4>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                There are no open pipeline items recorded here.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}