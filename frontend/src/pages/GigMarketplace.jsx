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
} from "lucide-react";
import { getGigs } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { FaRupeeSign } from "react-icons/fa";

export default function GigMarketplace() {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

    const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [gigs, setGigs] = useState([]);

  const [experience, setExperience] = useState("All");
  const [budget, setBudget] = useState("All");
  const [location, setLocation] = useState("Any");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const res = await getGigs();
      setGigs(res?.data?.gigs || []);
    } catch (err) {
      console.error("Error fetching gigs:", err);
    }
  };

  const filtered = [...gigs]
    .filter((gig) => {
      const searchLower = search.toLowerCase();

      const searchMatch =
        gig.title?.toLowerCase().includes(searchLower) ||
        gig.category?.toLowerCase().includes(searchLower);

      const experienceMatch =
        experience === "All" || gig.experienceLevel === experience;

      const locationMatch =
        location === "Any" ||
        (location === "Remote" && gig.location?.remote) ||
        (location === "Hybrid" && gig.location?.type === "Hybrid") ||
        (location === "Onsite" && gig.location?.type === "Onsite");

      let budgetMatch = true;

      if (budget === "$100-$500") {
        budgetMatch = gig.budget?.max <= 500;
      }

      if (budget === "$500-$1000") {
        budgetMatch = gig.budget?.min >= 500 && gig.budget?.max <= 1000;
      }

      if (budget === "$1000+") {
        budgetMatch = gig.budget?.min >= 1000;
      }

      return searchMatch && experienceMatch && budgetMatch && locationMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "budget-high":
          return (b.budget?.max || 0) - (a.budget?.max || 0);

        case "budget-low":
          return (a.budget?.min || 0) - (b.budget?.min || 0);

        case "latest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Header - Upgraded with professional typography and accent badge */}
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

          {/* Active Counters Summary */}
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

        {/* Search - Elevated wrapper with shadow parameters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-8 transition-all duration-200 focus-within:shadow-md focus-within:border-blue-200">
          <div className="relative">
            <Search
              className="absolute left-4 top-3.5 text-blue-500"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active project assignments, technical categories..."
              className="w-full bg-slate-50 text-slate-800 rounded-xl pl-12 pr-4 py-3 outline-none border border-slate-200 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Two-Column Grid Matching Your Original Code Structure */}
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Column (col-span-3) */}
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
                    Experience Level
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Budget Target
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="All">Any Scale</option>
                    <option value="₹100-₹500">Max ₹500</option>
                    <option value="₹500-₹1000">₹500 - ₹1000</option>
                    <option value="₹1000+">₹1000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Work Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                  >
                    <option value="Any">Any Arrangement</option>
                    <option value="Remote">Remote Operations</option>
                    <option value="Hybrid">Hybrid Models</option>
                    <option value="Onsite">Onsite Execution</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Gig Cards Feed Column (col-span-9) */}
          <div className="col-span-12 lg:col-span-9 space-y-5">
            {filtered.map((gig) => (
              <div
                key={gig._id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 relative overflow-hidden"
              >
                {/* Visual anchor stripe showing on card hover state */}
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
                  </div>
                  {user.role === "freelancer" ? (
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-blue-200 self-start sm:self-center text-sm"
                    onClick={() => {navigate(`/freelancer/gig/${gig._id}`)}}>
                      View
                    </button>
                  ) : user.role === "client" ? (
                    <button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-amber-200 self-start sm:self-center text-sm"
                    onClick= {() => navigate("/client/projects")}>
                      Manage Bids
                    </button>
                  ) : user.role === "admin" ? (
                    <button className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition hover:shadow-md hover:shadow-rose-200 self-start sm:self-center text-sm">
                      Moderate
                    </button>
                  ) : null}
                </div>

                {/* Sub-Card Grid Matrix Component */}
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
                          ? "Hourly"
                          : "Fixed"}{" "}
                        <span className="font-normal text-slate-500">
                          (${gig.budget?.min || 0}-${gig.budget?.max || 0})
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
                      <p className="text-slate-700 font-bold text-xs truncate">
                        {gig.duration || "Flexible Scale"}
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
                      <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                        Rating Cap
                      </p>
                      <p className="text-slate-700 font-bold text-xs truncate">
                        {gig.rating ? `${gig.rating} / 5.0` : "New System"}
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
                      ? new Date(gig.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently Available"}
                  </span>
                </div>
              </div>
            ))}

            {/* Graceful Empty Result Vector */}
            {filtered.length === 0 && (
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
