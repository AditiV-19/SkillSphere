import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import HeroBanner from "../components/dashboard/HeroBanner";
import StatSection from "../components/dashboard/StatSection";
import QuickActions from "../components/dashboard/QuickActions";
import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import { getFreelancerDashboardAnalytics } from "../services/api";

export default function Dashboards() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "freelancer";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (role !== "freelancer") {
        setLoading(false);
        return;
      }

      try {
        // Call your corrected service function
        const response = await getFreelancerDashboardAnalytics();

        // Set the data
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);
console.log(dashboardData)
  return (
    <DashboardLayout>
      <HeroBanner />

      {/* Handle Loading & Error States within the layout */}
      {loading ? (
        <div className="flex items-center justify-center py-20 mt-10">
          <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 border border-red-200 rounded-xl p-4 text-center mt-10 font-semibold">
          {error}
        </div>
      ) : (
        <>
          {/* Pass the real data into StatSection */}
          <StatSection dynamicData={dashboardData} />

          <QuickActions />

          {/* Render the Analytics Section only for Freelancers with valid data */}
          {role === "freelancer" && dashboardData && (
            <AnalyticsSection
              revenueData={dashboardData.revenueData}
              feedbackData={dashboardData.feedbackAnalytics}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
