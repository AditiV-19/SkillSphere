import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FaStar, FaChartLine } from "react-icons/fa";

// Add default empty values to the props to prevent "undefined" crashes
export default function AnalyticsSection({ revenueData = [], feedbackData = {} }) {
  
  // 1. Safeguard Chart Data
  const chartData = revenueData?.length > 0 ? revenueData : [
    { month: "N/A", revenue: 0 }
  ];

  // 2. Safeguard Feedback Data properties safely using Optional Chaining (?.)
  const safeRating = feedbackData?.averageRating || 0;
  const safeReviews = feedbackData?.totalReviews || 0;
  const safeSuccessRate = feedbackData?.successRate || 0;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Chart Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm">
              <FaChartLine size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
              <p className="text-gray-500 text-sm mt-1">Your earnings over the last 6 months</p>
            </div>
          </div>

          <div className="grow w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Feedback Analytics Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white shadow-sm">
              <FaStar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Client Feedback</h3>
              <p className="text-gray-500 text-sm mt-1">Based on verified reviews</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center grow py-4">
            <h2 className="text-5xl font-bold text-gray-900 mb-3">
              {safeRating}
            </h2>
            <div className="flex gap-1 text-yellow-400 text-xl mb-3">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.round(safeRating) ? "text-yellow-400" : "text-gray-200"} 
                />
              ))}
            </div>
            <p className="text-gray-500 text-sm font-medium">
              From {safeReviews} total reviews
            </p>
          </div>

          <div className="mt-4 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm font-medium">Job Success Rate</span>
              <span className="font-bold text-green-500 text-sm">{safeSuccessRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${safeSuccessRate}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}