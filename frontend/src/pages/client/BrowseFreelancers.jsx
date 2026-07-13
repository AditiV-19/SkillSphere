import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  IndianRupee,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import { searchFreelancers } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { startConversation } from "../../services/api";

export default function BrowseFreelancers() {
  const navigate = useNavigate();

  // Master Network Content States
  const [freelancers, setFreelancers] = useState([]);
  const [error, setError] = useState("");

  // Filtering States
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [debouncedMinRate, setDebouncedMinRate] = useState("");
  const [debouncedMaxRate, setDebouncedMaxRate] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [sort, setSort] = useState("");
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
    const timer = setTimeout(() => {
      if (minRate && maxRate && Number(minRate) > Number(maxRate)) {
        return;
      }
      setPage(1);
      setDebouncedMinRate(minRate);
      setDebouncedMaxRate(maxRate);
    }, 900);

    return () => clearTimeout(timer);
  }, [minRate, maxRate]);

  useEffect(() => {
    fetchFreelancerProfiles();
  }, [debouncedSearch, location, availability, minRating, sort, page]);


  const handleMessage = async (receiverId) => {
    try {

        const res = await startConversation(receiverId);

        navigate("/chats", {
            state: {
                conversation: res.data.conversation,
            },
        });

    } catch (err) {
        console.log(err);
    }
};


  const fetchFreelancerProfiles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await searchFreelancers({
        q: debouncedSearch,
        location,
        experienceLevel,
        minRate: debouncedMinRate,
        maxRate: debouncedMaxRate,
        availability,
        minRating,
        sort,
        page,

        limit: 12,
      });

      setFreelancers(response.data.freelancers);

      setPagination({
        totalPages: response.data.totalPages,
        totalResults: response.data.totalResults,
      });
    } catch (err) {
      console.error("Axios Discovery Failure Exception Stack:", err);

      const serverMessage = err.response?.data?.message || err.message;
      setError(
        `Failed to stream live freelancer records: ${serverMessage} (Status ${err.response?.status || "Network Error"})`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Header Block Module */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Discover Talent
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wide">
                Live Database Feed
              </span>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Source, evaluate, and hire independent professionals verified
              across your network.
            </p>
          </div>

          {/* Tab View Filter */}
          {/* <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-center">
            {["All", "Development", "Design", "AI"].map((domain) => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain.toLowerCase())}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeDomain === domain.toLowerCase()
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {domain}
              </button>
            ))}
          </div> */}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="shrink-0 text-rose-500" size={18} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Unified Search & Multi-Parameter Filter Row */}
        <div className="grid grid-cols-12 gap-4 mb-8">
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3.5 flex items-center">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-2.5 text-blue-500"
                size={20}
              />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search by names, core competencies, or tech stacks..."
                className="w-full bg-slate-50/50 text-slate-800 rounded-xl pl-10 pr-4 py-2 outline-none border border-slate-200 text-sm transition focus:border-blue-500 focus:bg-white "
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

          <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3.5 flex-wrap items-center gap-3">
            <SlidersHorizontal size={16} className="text-slate-400 shrink-0" />
            <select
              value={availability}
              onChange={(e) => {
                setPage(1);
                setAvailability(e.target.value);
              }}
              className="flex-1 min-w-32.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition focus:border-blue-500"
            >
              <option value="">All Availability</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <select
              value={minRating}
              onChange={(e) => {
                setPage(1);
                setMinRating(e.target.value);
              }}
              className="flex-1 min-w-32.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5★</option>
              <option value="4">4★ & Above</option>
              <option value="3">3★ & Above</option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              className="flex-1 min-w-32.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition focus:border-blue-500"
            >
              <option value="">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>

            <select
              value={experienceLevel}
              onChange={(e) => {
                setPage(1);
                setExperienceLevel(e.target.value);
              }}
              className="flex-1 min-w-32.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer transition focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>

            <div className="flex items-center gap-1.5 flex-1 min-w-45">
              <input
                type="number"
                min="0"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="Min ₹/hr"
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none transition focus:border-blue-500"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="number"
                min="0"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="Max ₹/hr"
                className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {pagination.totalResults} freelancers found
        </p>
        {loading && (
          <div className="flex justify-center py-4">
            <p className="text-sm text-slate-500">Searching...</p>
          </div>
        )}

        {/* Discovery Feed Column Container */}
        <div className="space-y-4">
          {freelancers.map((fl) => (
            <div
              key={fl._id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all duration-300" />

              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  {/* Status pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      {fl.availability?.status || "Available"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                      <Star
                        size={12}
                        className="fill-amber-500 text-amber-500"
                      />
                      {(fl.weightedRating || 5.0).toFixed(1)} (
                      {fl.totalReviews || 0} reviews)
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                      {`${fl.firstName ?? ""} ${fl.lastName ?? ""}`.trim() ||
                        fl.user?.username ||
                        "Unknown Freelancer"}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">
                      {fl.headline || "Independent Professional"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 max-w-3xl leading-relaxed font-medium pt-1 line-clamp-2">
                    {fl.about || "No summary profile provided yet."}
                  </p>
                </div>

                {/* Routing Link to Freelancer Specific Profile */}
                <div className="w-full md:w-auto self-stretch md:self-center flex items-center justify-end shrink-0">
                  <button
                    onClick={() => navigate(`/client/freelancer/${fl._id}`)}
                    className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <span>View Profile</span>
                    <ArrowRight size={15} />
                  </button>

                  <button
                    onClick={() => handleMessage(fl.user._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Message
                  </button>
                </div>
              </div>

              {/* Technical Skill Tags list */}
              {fl.skills && fl.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 items-center">
                  {fl.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    >
                      {skill.name}{" "}
                      {skill.proficiency ? `(${skill.proficiency})` : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Footnote Metadata Metrics Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <IndianRupee size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                      Hourly Rate
                    </p>
                    <p className="text-slate-700 font-bold text-xs truncate">
                      ₹{fl.hourlyRate || 0}/hr
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-slate-700 font-bold text-xs truncate">
                      {/* {fl.location?.remote
                        ? "Remote Network"
                        : fl.location?.city || "Local"} */}
                      {fl.location || "Not Specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {freelancers.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
              <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                No developer parameters match
              </h4>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                No verified records found in the database match your chosen
                search terms or experience tiers.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Previous
            </button>

            <span className="font-medium">
              Page {page} of {pagination.totalPages}
            </span>

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
