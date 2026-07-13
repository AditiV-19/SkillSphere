import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  Briefcase,
  ArrowUpDown,
  Loader2,
  X,
} from "lucide-react";
import { searchGigs } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { FaRupeeSign } from "react-icons/fa";

export default function GigMarketplace() {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [gigs, setGigs] = useState([]);

  // Filter States
  const [category, setCategory] = useState("");
  const [budgetType, setBudgetType] = useState("");
  const [remote, setRemote] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalResults: 0,
  });

  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchGigs();
  }, [debouncedSearch, category, budgetType, remote, sortBy, page]);

const fetchGigs = async () => {
  try {
    setLoading(true);

    const params = {
      q: debouncedSearch,
      sort: sortBy,
      page,
      limit: 10,
    };
    if (category) params.category = category;
    if (budgetType) params.budgetType = budgetType;
    if (remote !== "") params.remote = remote;

    const res = await searchGigs(params);

    setGigs(res.data.gigs || []);
    setPagination({
      totalPages: res.data.totalPages || 1,
      totalResults: res.data.totalResults || 0,
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Gig Marketplace
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                Live Feed
              </span>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Discover verified freelance opportunities and manage smart
              contract milestones.
            </p>
          </div>

          {/* Sort Summary */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm text-sm font-medium text-slate-600">
            <ArrowUpDown size={15} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-slate-700 font-semibold"
            >
              <option value="latest">Newest Openings</option>
              <option value="budget-high">Top Budget</option>
              <option value="budget-low">Entry Budget</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8 transition-all duration-200 focus-within:shadow-md focus-within:border-blue-200">
          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-blue-500"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search active project assignments, technical categories..."
              className="w-full bg-slate-50 text-slate-800 rounded-xl pl-12 pr-4 py-3 outline-none border border-slate-200 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
            {search && (
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSearch("");
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Column */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sticky top-5 space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 text-slate-800">
                <Filter size={18} className="text-blue-600" />
                <h2 className="font-bold text-base tracking-tight">
                  Refine Options
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setPage(1);
                      setCategory(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="">All Categories</option>
                    <option value="web development">Web Development</option>
                    <option value="mobile development">
                      Mobile Development
                    </option>
                    <option value="ai">AI</option>
                    <option value="design">Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Budget Target
                  </label>
                  <select
                    value={budgetType}
                    onChange={(e) => {
                      setPage(1);
                      setBudgetType(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="">All Budgets</option>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Work Location
                  </label>
                  <select
                    value={remote}
                    onChange={(e) => {
                      setPage(1);
                      setRemote(e.target.value); // Fixed: Directly updates remote
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="">All Locations</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {page} of {pagination.totalPages}
              </span>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Gig Cards Feed Column */}
          <div className="col-span-12 lg:col-span-9 space-y-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-500">
                {pagination.totalResults} gigs found
              </p>
              {loading && (
                <Loader2 className="animate-spin text-blue-500" size={20} />
              )}
            </div>

            {!loading &&
              gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all duration-300" />

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide">
                          <Briefcase size={12} />
                          {gig.category || "General"}
                        </span>
                        {gig.experienceLevel && (
                          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                            {gig.experienceLevel}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                        {gig.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {gig.description}
                      </p>
                    </div>
                    {user?.role === "freelancer" ? (
                      <button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-blue-200 self-start sm:self-center text-sm"
                        onClick={() => navigate(`/freelancer/gig/${gig._id}`)}
                      >
                        View
                      </button>
                    ) : user?.role === "client" ? (
                      <button
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-amber-200 self-start sm:self-center text-sm"
                        onClick={() => navigate("/client/projects")}
                      >
                        Manage Bids
                      </button>
                    ) : user?.role === "admin" ? (
                      <button className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-rose-200 self-start sm:self-center text-sm">
                        Moderate
                      </button>
                    ) : null}
                  </div>

                  {/* Sub-Card Grid Matrix */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                        <FaRupeeSign size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                          Budget Scale
                        </p>
                        <p className="text-slate-700 font-bold text-xs truncate">
                          {gig.budget?.budgetType === "hourly"
                            ? "Hourly "
                            : "Fixed "}
                          <span className="font-normal text-slate-500">
                            (₹{gig.budget?.min || 0}-₹{gig.budget?.max || 0})
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                          Timeline
                        </p>
                        <p className="text-slate-700 font-bold text-xs">
                          {gig.milestones?.length || 0} Milestones
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                          Environment
                        </p>
                        <p className="text-slate-700 font-bold text-xs truncate">
                          {gig.location?.remote
                            ? "Remote"
                            : `${gig.location?.city || "Local Ops"}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                        <Star size={16} className="fill-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase">Status</p>

                        <p className="font-bold text-xs capitalize">
                          {gig.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Requirement Section */}
                  {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                    <div className="flex gap-1.5 mt-5 flex-wrap items-center">
                      <span className="text-xs text-slate-400 font-bold mr-1 uppercase tracking-wider">
                        Requirements:
                      </span>
                      {gig.skillsRequired.map((skill, idx) => (
                        <span
                          key={`${gig._id}-skill-${idx}`}
                          className="bg-slate-100/80 text-slate-600 font-semibold px-3 py-1 rounded-lg text-xs border border-slate-200/40 transition hover:bg-slate-200/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Meta Timestamp */}
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Escrow Protection Active</span>
                    <span>
                      Posted:{" "}
                      {gig.createdAt
                        ? new Date(gig.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "Recently Available"}
                    </span>
                  </div>
                </div>
              ))}

            {/* Pagination Controls */}
            {gigs.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  disabled={page === 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Previous
                </button>

                <span className="text-sm font-medium text-slate-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            )}

            {/* Graceful Empty Result Vector */}
            {!loading && gigs.length === 0 && (
              <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
                <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                  <Search size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">
                  No active parameters match
                </h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  We couldn't track down matching assignments. Try relaxing your
                  sidebar filter parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
