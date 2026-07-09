import { useState, useEffect } from "react";
import { getFreelancerInvitations } from "../../services/api";
import { MailOpen, Calendar, IndianRupee, Briefcase, Check, X } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await getFreelancerInvitations();
      setInvitations(res.data?.invitations || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-slate-500">Loading invitations...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gig Invitations</h1>
          <p className="text-sm text-slate-500 mt-1">Exclusive project offers sent directly to your profile by clients.</p>
        </div>

        {error && <div className="p-4 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          {invitations.map((gig) => (
            <div key={gig._id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Gig details */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase">
                  New Invite
                </span>
                <h3 className="text-lg font-bold text-slate-800">{gig.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 max-w-2xl">{gig.description}</p>
                
                {/* Meta details */}
                <div className="flex gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><IndianRupee size={14}/> {gig.budget?.min} - {gig.budget?.max}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14}/> {gig.budget?.budgetType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button 
                  onClick={() => alert("Navigate to proposal flow or accept setup")} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <Check size={14}/> View & Apply
                </button>
              </div>

            </div>
          ))}

          {invitations.length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
              <MailOpen size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No active invitations</h4>
              <p className="text-xs text-slate-400 mt-1">When clients invite you to their gigs, they will show up right here.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}