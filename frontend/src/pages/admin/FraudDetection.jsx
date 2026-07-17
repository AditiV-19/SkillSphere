import { useEffect, useState } from "react";
import { getFraudFlags } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";

import { 
  ShieldAlert, 
  Users, 
  Activity, 
  AlertOctagon, 
  Loader2,
  SearchX,
  Mail,
  ExternalLink
} from "lucide-react";

export default function FraudDetection() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const { data } = await getFraudFlags();
      setFlags(data.flags || []);
    } catch (err) {
      console.error("Failed to load fraud flags", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculated precisely from your backend data structure
  const flaggedUsers = flags.length;
  const totalPayments = flags.reduce((sum, f) => sum + f.paymentCount24h, 0);
  const totalAmount = flags.reduce((sum, f) => sum + f.totalAmount24h, 0);

  // Quick action handler for the Admin
  const handleInvestigate = (email) => {
    window.location.href = `mailto:${email}?subject=Urgent: Suspicious Account Activity Review`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
        
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Fraud Detection</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Monitoring freelancers with 5+ completed payments in the last 24 hours.
          </p>
        </div>

        {/* Summary Cards */}
        {!loading && flags.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-rose-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-rose-500 w-5 h-5" />
                <h3 className="font-semibold text-slate-700">Flagged Users</h3>
              </div>
              <p className="text-3xl font-bold text-rose-700">{flaggedUsers}</p>
            </div>
            
            <div className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-amber-500 w-5 h-5" />
                <h3 className="font-semibold text-slate-700">Suspicious Payments</h3>
              </div>
              <p className="text-3xl font-bold text-amber-700">{totalPayments}</p>
            </div>
            
            <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <AlertOctagon className="text-red-600 w-5 h-5" />
                <h3 className="font-semibold text-red-900">Total Value at Risk</h3>
              </div>
              <p className="text-3xl font-bold text-red-700">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Scanning for suspicious activity…</p>
            </div>
          ) : flags.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                <ShieldAlert className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No active threats</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                No freelancers have triggered the high-velocity volume threshold in the last 24 hours.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Freelancer</th>
                    <th className="px-6 py-4 whitespace-nowrap">Velocity (24h)</th>
                    <th className="px-6 py-4 whitespace-nowrap">Volume (24h)</th>
                    <th className="px-6 py-4 whitespace-nowrap">Trigger Reason</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {flags.map((flag) => (
                    <tr key={flag.userId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {/* Directly mapping your backend's 'username' and 'email' */}
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{flag.username}</p>
                          <span className="text-slate-300 text-xs text-[10px]">ID: {flag.userId.slice(-6)}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">{flag.email}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                          {flag.paymentCount24h} transactions
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="font-bold text-red-600">₹{flag.totalAmount24h.toLocaleString()}</p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="text-slate-600 font-medium max-w-50" title={flag.reason}>
                          {flag.reason}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Opens their profile/transactions in a new tab if you build that route later */}
                          <button 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View User Profile"
                            onClick={() => navigate(`/admin/freelancer/${flag.userId}`)}
                          >
                            <ExternalLink size={16} />
                          </button>
                          
                          {/* Opens an email draft to the flagged user */}
                          <button 
                            onClick={() => handleInvestigate(flag.email)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm active:scale-95"
                          >
                            <Mail size={14} />
                            Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}