import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  Send,
  AlertCircle,
  FileText,
  IndianRupee,
} from "lucide-react";
import { createGig } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import FileUploader from "../../components/FileUploader";

export default function PostProject() {
  const navigate = useNavigate();

  // Extract client information safely from local storage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Form Field States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [duration, setDuration] = useState("");

  const [attachments, setAttachments] = useState([]);

  // Nested Object States (Budget & Location)
  const [budgetType, setBudgetType] = useState("fixed");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [remote, setRemote] = useState(true);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Milestones State Array
  const [milestones, setMilestones] = useState([]);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");

  // UX & Error States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick Guard: Check if user is actually a client
  if (!user || user.role !== "client") {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={36} />
            <h2 className="text-lg font-bold text-slate-800">Access Denied</h2>
            <p className="text-slate-500 text-sm mt-1">
              Only registered clients can post projects to the marketplace
              ecosystem.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Milestone Handling
  const addMilestone = () => {
    if (!milestoneTitle || !milestoneAmount) return;
    setMilestones([
      ...milestones,
      { name: milestoneTitle, amount: parseFloat(milestoneAmount) },
    ]);
    setMilestoneTitle("");
    setMilestoneAmount("");
  };

  const removeMilestone = (indexToRemove) => {
    setMilestones(milestones.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (parseFloat(maxBudget) < parseFloat(minBudget)) {
      setError("Max budget cannot be less than your minimum budget entry.");
      setLoading(false);
      return;
    }

    const cleanSkills = skillsRequired
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    // 🚀 THE KEY TRICK: Construct a multipart FormData payload context
    const formData = new FormData();

    // Flatten native string values
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("experienceLevel", experienceLevel);
    formData.append("duration", duration);
    formData.append("remote", String(remote));

    if (!remote) {
      formData.append("city", city);
      formData.append("state", stateName);
      formData.append("country", country);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
    }

    // Convert arrays & objects to explicit JSON strings for Multer parsing on the backend
    formData.append("skillsRequired", JSON.stringify(cleanSkills || []));
    formData.append(
      "budget",
      JSON.stringify({
        budgetType,
        min: parseFloat(minBudget) || 0,
        max: parseFloat(maxBudget) || 0,
      }),
    );
    formData.append("milestones", JSON.stringify(milestones || []));

    // Append our native staged file binary assets into the form buffer sequentially
    attachments.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // ⚠️ Note: Ensure your createGig api utility method accepts the plain formData instance directly
      const res = await createGig(formData);
      if (res.data.success) {
        navigate("/client/projects");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred during file deployment pipeline validation.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Header Module */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Post a Project
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                Client Workspace
              </span>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Deploy smart milestone assignments to hire verified professionals
              across the local network.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="shrink-0 text-rose-500" size={18} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Master Structure Grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-12 gap-8 items-start"
        >
          {/* Main Scope Parameters Form Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Core Details Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800">
                <Briefcase size={18} className="text-blue-600" />
                <h2 className="font-bold text-base tracking-tight">
                  Project Overview
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Project Title
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full-Stack MERN Platform Deployment"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Detailed Scope Description
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Outline requirements, features, project scale, expectations..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Domain Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Applications">
                        Mobile Applications
                      </option>
                      <option value="UI/UX Engineering">
                        UI/UX Engineering
                      </option>
                      <option value="AI / Data Processing">
                        AI / Data Processing
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Experience Tier Requirement
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm font-medium"
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Expert">Expert Level</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Required Technical Stack (Comma Separated)
                  </label>
                  <input
                    required
                    type="text"
                    value={skillsRequired}
                    onChange={(e) => setSkillsRequired(e.target.value)}
                    placeholder="React, Node.js, Express, MongoDB, Socket.io"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm"
                  />
                </div>
                <FileUploader
                  attachments={attachments}
                  setAttachments={setAttachments}
                />
              </div>
            </div>

            {/* Smart Milestone Escrow Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText size={18} className="text-blue-600" />
                  <h2 className="font-bold text-base tracking-tight">
                    Milestone Payments (Escrow)
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Optional Setup
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <div className="md:col-span-7">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Deliverable Name
                  </label>
                  <input
                    type="text"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="e.g., UI Architecture Review"
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Fund Allocation ()
                  </label>
                  <input
                    type="number"
                    value={milestoneAmount}
                    onChange={(e) => setMilestoneAmount(e.target.value)}
                    placeholder="250"
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Added Milestones Render Feed */}
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((ms, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">
                          M{index + 1}
                        </span>
                        <span>{ms.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">
                          ₹{ms.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Configuration Parameters Side Column (col-span-4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            {/* Financial Architecture Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-800">
                <IndianRupee size={18} className="text-emerald-600" />
                <h2 className="font-bold text-base tracking-tight">
                  Budget Scale
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Contract Model
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setBudgetType("fixed")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${budgetType === "fixed" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Fixed Price
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType("hourly")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${budgetType === "hourly" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Hourly Scale
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Min Budget (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none text-sm focus:bg-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Max Budget (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none text-sm focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Estimated Timeline Scale
                  </label>
                  <input
                    required
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 Weeks, 1 Month"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none text-sm focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Geographical Indexing Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-800">
                <MapPin size={18} className="text-indigo-600" />
                <h2 className="font-bold text-base tracking-tight">
                  Work Environment
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-600 uppercase">
                    Remote Configuration
                  </span>
                  <input
                    type="checkbox"
                    checked={remote}
                    onChange={(e) => setRemote(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {!remote && (
                  <div className="space-y-4 pt-1 transition-all duration-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Latitude
                        </label>
                        <input
                          type="text"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Longitude
                        </label>
                        <input
                          type="text"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Execution CTA Module */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-sm transition hover:shadow-md hover:shadow-blue-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {loading ? "Deploying Project..." : "Deploy to Marketplace"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
