import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getMyTransactions } from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  SearchX, 
  Filter,
  Loader2
} from "lucide-react";

const statusStyles = {
  created: "bg-slate-50 text-slate-600 border-slate-200",
  held: "bg-amber-50 text-amber-700 border-amber-200",
  released: "bg-blue-50 text-blue-700 border-blue-200",
  paid_out: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-rose-50 text-rose-700 border-rose-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const TransactionHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getMyTransactions({ status: statusFilter || undefined });
      setPayments(res.data.payments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header & Controls Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ReceiptText size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Track your payments, escrow holds, and completed payouts.
            </p>
          </div>

          {/* Styled Filter Dropdown */}
          <div className="relative group shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm transition-all"
            >
              <option value="">All Transactions</option>
              <option value="held">In Escrow (Held)</option>
              <option value="released">Released</option>
              <option value="paid_out">Paid Out</option>
              <option value="refunded">Refunded</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Transactions Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Fetching your transactions…</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                <SearchX className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No transactions found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {statusFilter 
                  ? `You don't have any transactions with the status "${statusFilter.replace('_', ' ')}".` 
                  : "When you fund milestones or receive payments, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => {
                const isOutgoing = p.client._id === (user?._id || user?.id);
                // Fallbacks for names based on whether it's a client company or freelancer name
                const counterpartyName = isOutgoing 
                  ? (p.freelancer?.firstName ? `${p.freelancer.firstName} ${p.freelancer.lastName}` : "Freelancer") 
                  : (p.client?.companyName || p.client?.firstName || "Client");

                return (
                  <div 
                    key={p._id} 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Left Side: Icon & Details */}
                    <div className="flex items-start gap-4">
                      {/* Directional Icon */}
                      <div className={`mt-0.5 shrink-0 p-2.5 rounded-full ${
                        isOutgoing ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {isOutgoing ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownLeft size={18} strokeWidth={2.5} />}
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 line-clamp-1">
                          {p.gig?.title || "Unknown Gig"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="font-medium text-slate-700">
                            {isOutgoing ? `To ${counterpartyName}` : `From ${counterpartyName}`}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">
                            {dayjs(p.createdAt).format("MMM D, YYYY · h:mm A")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Amount & Status */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center ml-14 sm:ml-0 gap-2">
                      <p className={`text-lg font-bold ${
                        isOutgoing ? "text-slate-900" : "text-emerald-600"
                      }`}>
                        {isOutgoing ? "-" : "+"}₹{p.amount.toLocaleString()}
                      </p>
                      
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${statusStyles[p.status] || statusStyles.created}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionHistory;