import { useState, useEffect } from "react";
import { 
  getPendingVerifications, 
  approveVerification, 
  rejectVerification 
} from "../../services/api";
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, User } from "lucide-react";
import DocumentViewer from "./DocumentViewer"; // We will create this next
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function VerificationReview() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await getPendingVerifications();
      if (response.data.success) {
        setPendingRequests(response.data.freelancers);
      }
    } catch (error) {
      console.error("Failed to fetch pending verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      await approveVerification(id, { badgeType: "Identity Verified" });
      alert("Freelancer verified successfully!");
      setSelectedFreelancer(null);
      fetchPendingRequests(); 
    } catch (error) {
      alert("Error approving verification: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setProcessing(true);
    try {
      await rejectVerification(id, { reason: rejectReason });
      alert("Verification rejected.");
      setSelectedFreelancer(null);
      setRejectReason("");
      fetchPendingRequests();
    } catch (error) {
      alert("Error rejecting verification: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
        <div className="p-6 text-slate-500">Loading pending requests...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Verifications
        </h2>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
          {pendingRequests.length} Pending
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-slate-300" />
            <p>All caught up! No pending verification requests.</p>
          </div>
        ) : (
          pendingRequests.map((freelancer) => (
            <div key={freelancer._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div>
                <h3 className="font-semibold text-slate-900">{freelancer.user?.username || "Freelancer"}</h3>
                <p className="text-sm text-slate-500">{freelancer.user?.email}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted: {new Date(freelancer.verification.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    window.open(`/admin/freelancer/${freelancer._id}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                >
                  <User className="w-4 h-4" /> View Profile
                </button>

                <button
                  onClick={() => setSelectedFreelancer(freelancer)}
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" /> Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Review Identity Documents</h2>
              <button onClick={() => setSelectedFreelancer(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <p><strong>Freelancer:</strong> {selectedFreelancer.user?.username || "N/A"}</p>
                <p><strong>Name:</strong> {selectedFreelancer.firstName|| "N/A"} {selectedFreelancer.lastName|| ""}</p>
                <p><strong>Email:</strong> {selectedFreelancer.user?.email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Submitted Documents</h3>
                {selectedFreelancer.verification.documents.map((doc, idx) => (
                  <DocumentViewer key={idx} documentType={doc.documentType} url={doc.url} />
                ))}
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Admin Decision</h3>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedFreelancer._id)}
                    disabled={processing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Verification
                  </button>
                </div>

                <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100 space-y-3">
                  <label className="text-sm font-semibold text-red-800 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Reject Request (Requires Reason)
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Document is blurry, name mismatch..."
                    className="w-full border border-red-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleReject(selectedFreelancer._id)}
                    disabled={processing || !rejectReason.trim()}
                    className="w-full font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" /> Reject Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}