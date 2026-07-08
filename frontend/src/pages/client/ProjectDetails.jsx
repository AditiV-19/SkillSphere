import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  IndianRupee, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  FileText, 
  AlertCircle, 
  User, 
  ShieldCheck,
  Edit3,
  Save,
  X,
  Star,
  ExternalLink
} from "lucide-react";
import { getGigById, updateGig } from "../../services/api"; 
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Master States
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeView, setActiveView] = useState("overview");

  // Inline Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editMinBudget, setEditMinBudget] = useState("");
  const [editMaxBudget, setEditMaxBudget] = useState("");
  const [editDuration, setEditDuration] = useState("");

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await getGigById(id);
      const data = res?.data?.gig || res?.data || null;
      setGig(data);
      
      // Seed values into edit forms ahead of time
      if (data) {
        setEditTitle(data.title || "");
        setEditDescription(data.description || "");
        setEditCategory(data.category || "Web Development");
        setEditMinBudget(data.budget?.min || "");
        setEditMaxBudget(data.budget?.max || "");
        setEditDuration(data.duration || "");
      }
    } catch (err) {
      setError("Failed to retrieve contract structure parameters securely.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Edit View
  const handleEditToggle = () => {
    if (isEditing) {
      // If cancelling, reset values back to current loaded gig data
      setEditTitle(gig.title || "");
      setEditDescription(gig.description || "");
      setEditCategory(gig.category || "Web Development");
      setEditMinBudget(gig.budget?.min || "");
      setEditMaxBudget(gig.budget?.max || "");
      setEditDuration(gig.duration || "");
    }
    setIsEditing(!isEditing);
    setError("");
    setSuccessMsg("");
  };

  // Submit Updated Changes Payload
  const handleSaveChanges = async () => {
    setError("");
    setSuccessMsg("");

    if (parseFloat(editMaxBudget) < parseFloat(editMinBudget)) {
      setError("Maximum budget allocation cannot be lower than the minimum parameter entry.");
      return;
    }

    const updatedPayload = {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      duration: editDuration,
      budget: {
        ...gig.budget,
        min: parseFloat(editMinBudget),
        max: parseFloat(editMaxBudget)
      }
    };

    try {
      // Trigger your API update service call passing the payload and id
      await updateGig(updatedPayload, id);
      
      // Update local state smoothly so the UI updates immediately
      setGig({
        ...gig,
        ...updatedPayload
      });
      
      setSuccessMsg("Project metrics rewritten and synchronized successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to commit local project adjustments over the network.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 font-medium text-sm">
          Compiling project state architecture...
        </div>
      </DashboardLayout>
    );
  }

  if (error && !gig) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={32} />
            <h4 className="text-base font-bold text-slate-800">Workspace Error</h4>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
            <button onClick={() => navigate("/my-projects")} className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold">
              Return to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate("/client/projects")} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition mb-6 uppercase tracking-wider"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Status Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 mb-6">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3.5 mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Context Dynamic Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-white border border-slate-200 font-extrabold text-2xl text-slate-800 tracking-tight rounded-xl p-2 w-full max-w-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              ) : (
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{gig.title}</h1>
              )}
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                {gig.status || "Open"}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1"><Briefcase size={14}/> {gig.category || "General"}</span>
              <span>•</span>
              <span>Posted: {new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Control Trigger Group */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveChanges}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
                <button 
                  onClick={handleEditToggle}
                  className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditToggle}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <Edit3 size={14} />
                <span>Edit Project</span>
              </button>
            )}

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveView("overview")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeView === "overview" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView("proposals")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeView === "proposals" ? "bg-white text-slate-800 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-700"}`}
              >
                Proposals ({gig.proposalsCount || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Master Details Content Layout Matrix */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {activeView === "overview" ? (
              <>
                {/* Editable Scope Cards Description */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Specification</h3>
                  {isEditing ? (
                    <textarea
                      rows={6}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none transition focus:border-blue-500 focus:bg-white text-sm resize-none"
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                  )}
                </div>

                {/* 🚀 NEW: Project Documentation/Attachments Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Documentation</h3>
                  {gig.attachments && gig.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {gig.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs transition-all hover:bg-slate-100/70 group">
                          <div className="flex items-center gap-2.5 font-semibold text-slate-700 min-w-0">
                            <FileText size={16} className="text-blue-500 shrink-0" />
                            <span className="truncate group-hover:text-blue-600 transition-colors">{file.name || `Document_${idx + 1}`}</span>
                          </div>
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-slate-400 hover:text-blue-600 shadow-2xs transition shrink-0 ml-2"
                            title="Open file in new tab"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic">No specifications or media files uploaded for this project.</p>
                  )}
                </div>

                {/* Editable Domain Category Dropdown */}
                {isEditing && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modify Platform Category</h3>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 outline-none w-full max-w-sm text-sm font-semibold focus:bg-white focus:border-blue-500"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Applications">Mobile Applications</option>
                      <option value="UI/UX Engineering">UI/UX Engineering</option>
                      <option value="AI / Data Processing">AI / Data Processing</option>
                    </select>
                  </div>
                )}

                {/* Escrow Milestone Display */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-blue-600" />
                      <span>Smart Escrow Contract Milestones</span>
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                      <ShieldCheck size={12}/> Locked
                    </span>
                  </div>
                  <div className="space-y-3">
                    {gig.milestones?.map((ms, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                        <div className="flex items-center gap-3 font-semibold text-slate-700">
                          <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-0.5 rounded font-bold">M{idx + 1}</span>
                          <span>{ms.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-800">₹{ms.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
             <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
                <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                  <User size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">No active parameters match</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  We couldn't track down matching assignments. Freelancers haven't submitted bids for this project layout yet.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Sub-Card Grid Matrix Component format */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Sub-Card 1: Budget Scale */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm font-medium text-slate-600">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <IndianRupee size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Budget Scale</p>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input type="number" value={editMinBudget} onChange={(e) => setEditMinBudget(e.target.value)} className="w-1/2 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 font-bold outline-none" placeholder="Min" />
                    <input type="number" value={editMaxBudget} onChange={(e) => setEditMaxBudget(e.target.value)} className="w-1/2 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 font-bold outline-none" placeholder="Max" />
                  </div>
                ) : (
                  <p className="text-slate-700 font-bold text-xs truncate">
                    {gig.budget?.budgetType === "hourly" ? "Hourly" : "Fixed"}{" "}
                    <span className="font-normal text-slate-500">(₹{gig.budget?.min || 0}-₹{gig.budget?.max || 0})</span>
                  </p>
                )}
              </div>
            </div>

            {/* Sub-Card 2: Timeline */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm font-medium text-slate-600">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Timeline</p>
                {isEditing ? (
                  <input type="text" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 font-bold outline-none" />
                ) : (
                  <p className="text-slate-700 font-bold text-xs truncate">{gig.duration || "Flexible Scale"}</p>
                )}
              </div>
            </div>

            {/* Sub-Card 3: Environment */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm font-medium text-slate-600">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <MapPin size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Environment</p>
                <p className="text-slate-700 font-bold text-xs truncate">
                  {gig.location?.remote ? "Remote" : `${gig.location?.city || "Local Ops"}`}
                </p>
              </div>
            </div>

            {/* Sub-Card 4: Rating Cap */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm font-medium text-slate-600">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 shrink-0">
                <Star size={16} className="fill-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Rating Cap</p>
                <p className="text-slate-700 font-bold text-xs truncate">
                  {gig.rating ? `${gig.rating} / 5.0` : "New System"}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}