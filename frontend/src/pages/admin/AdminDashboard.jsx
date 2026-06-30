import DashboardLayout from "../../components/dashboard/DashboardLayout";
import HeroBanner from "../../components/dashboard/HeroBanner";
import StatSection from "../../components/dashboard/StatSection";
import QuickActions from "../../components/dashboard/QuickActions";

export default function ClientDashboard() {
    return (
        <DashboardLayout>

            <HeroBanner />

            <StatSection />

            <QuickActions />

        </DashboardLayout>
    );
}