import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGigById,
  // Add your proposal submission or delete API services here as needed
} from "../../services/api.js";
import DashboardLayout from "../../components/dashboard/DashboardLayout.jsx";
import {
  ChevronLeft,
  Briefcase,
  IndianRupee,
  Calendar,
  MapPin,
  AlertCircle,
  FileText,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function GigDetails() {
  const { gigId } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 💡 MOCK ROLE CHECK: Replace this with your actual Auth State / Context later
  // e.g., const { user } = useAuth();
  const [userRole, setUserRole] = useState("freelancer"); // Set to "client" to test client view

  const [isInvited, setIsInvited] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || "";

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
    }
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getGigById(gigId);
      const dataPayload = response.data?.gig || response.data;

      setGig(dataPayload);

      if (dataPayload && dataPayload.invitedFreelancers) {
        // Double check if the logged-in User ID exists inside the invited array
        const hasInvite =
          dataPayload.invitedFreelancers.includes(user.id);
          
        setIsInvited(hasInvite);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load project details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    alert(`Initiating application workspace for: ${gig.title}`);
    // Navigate to your proposal submission page or trigger a modal
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center text-slate-500 font-medium text-sm">
          Fetching contract parameters from server...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !gig) {
    return (
      <DashboardLayout>
        <div className="p-8 min-h-screen bg-slate-50/50 flex items-center justify-center">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-sm max-w-md">
            <AlertCircle className="text-rose-500 mx-auto mb-3" size={32} />
            <h4 className="text-base font-bold text-slate-800">
              Project Error
            </h4>
            <p className="text-slate-500 text-sm mt-1">
              {error || "This project index could not be isolated."}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        {/* Back Button Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition uppercase tracking-wider mb-6"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        {/* Main Dashboard Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                    gig.status === "open"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {gig.status}
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {gig.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Posted on {new Date(gig.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-500" /> Project
                  Description
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {gig.description || "No project description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Metrics and Conditional Control Actions */}
          <div className="space-y-6">
            {/* Financials & Terms Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                Budget Parameters
              </h2>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                    Estimated Budget
                  </p>
                  <p className="text-slate-800 font-extrabold text-base">
                    ₹{gig.budget?.min} – ₹{gig.budget?.max}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                    Rate Type
                  </p>
                  <p className="text-slate-700 font-bold text-sm capitalize">
                    {gig.budget?.budgetType || "Fixed Rate"} Contract
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* 🚀 CONDITIONAL ACTION MODULE */}
              <div className="pt-2">
                {userRole === "client" ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/client/gig/${gig._id}/edit`)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                    >
                      Edit Project Spec
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleApply}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle size={14} />{" "}
                      {isInvited ? "Accept & Apply" : "Apply for Gig"}
                    </button>
                    {isInvited && (
                      <button
                        onClick={() => navigate(-1)} // You can replace this later with a handleDeclineInvite API call
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle size={14} />
                        <span>Decline Offer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Client Context Details Card */}
            {gig.client && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User size={15} className="text-slate-400" /> About Client
                </h2>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {gig.client.companyName || "Verified Organization"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {gig.client.industry || "Independent Industry Operations"}
                  </p>
                </div>
                {gig.client.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="shrink-0" />
                    <span>
                      {/* 🚀 FIX: Dynamically combine only existing fields with commas */}
                      {[
                        gig.client.location.address,
                        gig.client.location.city,
                        gig.client.location.state,
                        gig.client.location.country,
                      ]
                        .filter(Boolean) // Removes undefined/null/empty strings
                        .join(", ")}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
