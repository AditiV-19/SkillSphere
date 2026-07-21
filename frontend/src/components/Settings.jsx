import DashboardLayout from "./dashboard/DashboardLayout";
import TwoFactorSetup from "./TwoFactorSetup"; 

export default function Settings() {
  return (
    <DashboardLayout>
        <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
           <TwoFactorSetup />
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}