import { dashboardContent } from "../../data/dashboardContent";
import QuickActionCard from "./QuickActionCard";

export default function QuickActions() {

    const user = JSON.parse(localStorage.getItem("user"));

    const role = user?.role || "freelancer";

    const actions = dashboardContent[role].quickActions;

    return (

        <div className="mt-10">

            <h2 className="text-2xl font-bold mb-6">
                Quick Actions
            </h2>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {actions.map((action) => (

                    <QuickActionCard
                        key={action.title}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        color={action.color}
                        route={action.route}
                    />

                ))}

            </div>

        </div>

    );

}