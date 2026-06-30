import StatCard from "./StatCard";
import { dashboardContent } from "../../data/dashboardContent";

export default function StatSection() {
    
    const user = JSON.parse(localStorage.getItem("user"));

    const role = user?.role || "freelancer";

    const stats = dashboardContent[role].stats;

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

            {stats.map((stat) => (

                <StatCard
                    key={stat.title}
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