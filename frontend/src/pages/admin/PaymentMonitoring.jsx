import { useEffect, useState } from "react";
import { getAdminPayments, getFraudFlags } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Filter, 
  SearchX, 
  Loader2,
  Activity
} from "lucide-react";

// Standardized status styles matching your Payment schema
const statusStyles = {
  created: "bg-slate-50 text-slate-600 border-slate-200",
  held: "bg-amber-50 text-amber-700 border-amber-200",
  released: "bg-blue-50 text-blue-700 border-blue-200",
  paid_out: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const PaymentMonitoring = () => {
  const [payments, setPayments] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, flagsRes] = await Promise.all([
        getAdminPayments({ status: statusFilter || undefined }),
        getFraudFlags(),
      ]);
      setPayments(paymentsRes.data.payments);
      setFlags(flagsRes.data.flags);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Monitoring</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Admin overview of all platform transactions, escrow holds, and security alerts.
          </p>
        </div>

        {/* Fraud Flags Section */}
        {flags.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-600" size={20} />
              <h3 className="font-bold text-red-800 tracking-tight">Security & Fraud Alerts</h3>
            </div>
            <div className="space-y-2">
              {flags.map((f) => (
                <div key={f.userId} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm bg-white/60 p-2.5 rounded-lg border border-red-100">
                  <span className="font-semibold text-red-900">{f.name}</span>
                  <span className="text-red-500">({f.email})</span>
                  <span className="text-red-400 mx-1">—</span>
                  <span className="font-medium text-red-700">
                    {f.paymentCount24h} payments totalling ₹{f.totalAmount24h.toLocaleString()} in 24h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table & Controls Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Activity size={18} className="text-slate-400" />
              <h3>Transaction Ledger</h3>
            </div>
            
            <div className="relative group shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm transition-all"
              >
                <option value="">All Statuses</option>
                <option value="created">Created</option>
                <option value="held">In Escrow</option>
                <option value="released">Released</option>
                <option value="paid_out">Paid Out</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Loading platform transactions…</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                <SearchX className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No transactions found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Try adjusting your status filter or check back later.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Gig Details</th>
                    <th className="px-6 py-4 whitespace-nowrap">Client</th>
                    <th className="px-6 py-4 whitespace-nowrap">Freelancer</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
                    <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-50">
                          {p.gig?.title || "Unknown Gig"}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{p._id.slice(-6)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{p.client?.companyName || p.client?.firstName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{p.client?.username || p.client?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{p.freelancer?.firstName} {p.freelancer?.lastName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{p.freelancer?.username || p.freelancer?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-900">₹{p.amount?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${
                            statusStyles[p.status] || statusStyles.created
                          }`}>
                            {p.status.replace("_", " ")}
                          </span>
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
};

export default PaymentMonitoring;