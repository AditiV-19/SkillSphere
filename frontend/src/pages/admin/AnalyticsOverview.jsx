import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Tag, 
  BarChart3, 
  PieChart, 
  Loader2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { getAnalytics } from "../../services/api";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

// Enhanced Stat Card Component
const StatCard = ({ label, value, icon: Icon, colorClass, bgClass, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all duration-300 group cursor-default relative overflow-hidden">
    {/* Subtle background glow effect on hover */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${bgClass}`}></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className={`p-2.5 rounded-xl ${bgClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      {trend && (
        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-2">
          <ArrowUpRight className="w-3 h-3" />
          {trend}% from last month
        </p>
      )}
    </div>
  </div>
);

const AnalyticsOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Premium Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Compiling platform analytics…</p>
        </div>
      </DashboardLayout>
    );
  }

  // Premium Empty/Error State
  if (!data) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-[50vh] max-w-4xl mx-auto mt-8">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't load the analytics data at this time. Please check your connection or try refreshing the page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Pre-calculate maximums for visual scaling
  const maxCategoryCount = Math.max(...(data.topCategories?.map(c => c.count) || []), 1);
  const maxRevenue = Math.max(...(data.monthlyRevenue?.map(m => m.total) || []), 1);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Platform Analytics</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Real-time overview of revenue, users, and platform health.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              label="Platform Revenue" 
              value={`₹${data.platformRevenue?.toLocaleString() || 0}`} 
              icon={TrendingUp}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
              trend={data.revenueTrend}
            />
            <StatCard 
              label="Active Freelancers" 
              value={data.activeFreelancers || 0} 
              icon={Users}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            />
            <StatCard 
              label="Job Success Rate" 
              value={`${data.jobSuccessRate || 0}%`} 
              icon={CheckCircle2}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
            />
            <StatCard 
              label="Top Category" 
              value={data.topCategories?.[0]?.category || "—"} 
              icon={Tag}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Categories List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800">Top Categories</h3>
              </div>
              
              <div className="space-y-6">
                {data.topCategories?.length > 0 ? data.topCategories.map((c, index) => {
                  const widthPct = (c.count / maxCategoryCount) * 100;
                  // Alternate colors for a bit more visual flair
                  const barColors = ["bg-indigo-500", "bg-blue-500", "bg-sky-500", "bg-cyan-500", "bg-teal-500"];
                  const color = barColors[index % barColors.length];

                  return (
                    <div key={c.category} className="group cursor-default">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-slate-700">{c.category}</span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          {c.count} gigs
                        </span>
                      </div>
                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out opacity-90 group-hover:opacity-100 ${color}`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-8 opacity-50">
                    <PieChart className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-400 text-center">No category data yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800">Revenue Forecast (Last 6 Months)</h3>
              </div>
              
              <div className="flex-1 flex items-end gap-3 sm:gap-6 mt-auto min-h-70 relative px-2">
                {/* Subtle background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 border-b-2 border-slate-100">
                  <div className="w-full border-t border-slate-100 border-dashed"></div>
                  <div className="w-full border-t border-slate-100 border-dashed"></div>
                  <div className="w-full border-t border-slate-100 border-dashed"></div>
                  <div className="w-full border-t border-slate-100 border-dashed"></div>
                </div>

                {data.monthlyRevenue?.length > 0 ? data.monthlyRevenue.map((m) => {
                  const heightPct = (m.total / maxRevenue) * 100;
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-3 group relative z-10 h-full justify-end pb-8">
                      {/* Enhanced Tooltip on Hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-20">
                        ₹{m.total.toLocaleString()}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                      
                      {/* Styled Bar with Gradients */}
                      <div
                        className="w-full max-w-12 bg-linear-to-t from-emerald-500 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300 rounded-t-xl transition-all duration-300 relative shadow-sm"
                        style={{ height: `${heightPct}%` }}
                      >
                        {/* Subtle inner highlight for 3D effect */}
                        <div className="absolute inset-0 rounded-t-xl border-t border-white/30 border-x border-x-white/10"></div>
                      </div>
                      
                      {/* X-Axis Label */}
                      <span className="absolute bottom-0 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                        {m.label}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                    <BarChart3 className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-400">No revenue data available.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsOverview;