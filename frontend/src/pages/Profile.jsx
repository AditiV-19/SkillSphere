import FreelancerProfile from "./freelancer/FreelancerProfile";
import ClientProfile from "./client/ClientProfile";
import AdminProfile from "./admin/AdminDashboard";
import DashboardLayout from "../components/dashboard/DashboardLayout";
export default function Profile() {

    const user = JSON.parse(localStorage.getItem("user"));

    return(
        <DashboardLayout>
            {user?.role === "freelancer" ? (
                <FreelancerProfile />
            ) : user?.role === "client" ? (
                <ClientProfile />
            ) : (
                <div>Please login</div>
            )
            }
        </DashboardLayout>
    )
}