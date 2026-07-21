import StatCard from "./StatCard";
import { dashboardContent } from "../../data/dashboardContent";

export default function StatSection({ dynamicData }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "freelancer";

  // 1. Get the base static layout for the current role
  let stats = dashboardContent[role].stats;

  // 2. If it's a freelancer and the API data has loaded, override the values
  if (role === "freelancer" && dynamicData) {
    stats = [
      {
        ...stats[0], // Profile Views
        value: dynamicData.profileViews?.toLocaleString() || "0",
      },
      {
        ...stats[1], // Gig Applications
        value: dynamicData.gigApplications?.toLocaleString() || "0",
      },
      {
        ...stats[2], // Available Earnings
        subtitle: `In Wallet :₹${(dynamicData.earningsStatistics?.availableForWithdrawal || 0).toLocaleString()}`,
        value: `₹${(dynamicData.earningsStatistics?.totalEarnings || 0).toLocaleString()}`,
      },
      {
        ...stats[3], // Funds in Escrow
        value: `₹${(dynamicData.earningsStatistics?.activeEscrow || 0).toLocaleString()}`,
      },
    ];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title || index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}