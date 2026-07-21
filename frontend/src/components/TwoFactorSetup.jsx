import { useState } from "react";
import { toggle2FA } from "../services/api"; 

export default function TwoFactorSetup() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isEnabled, setIsEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await toggle2FA();
      const newState = response.data.isEnabled;
      
      setIsEnabled(newState);
      
      // Update local storage so the app remembers the new setting
      if (user) {
        user.isTwoFactorEnabled = newState;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (error) {
      alert("Failed to update 2FA settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication (Email)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Receive a secure 6-digit code in your email inbox every time you log in.
          </p>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
            isEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      
      <div className={`p-4 rounded-lg border ${isEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
        <p className={`text-sm font-medium ${isEnabled ? "text-green-800" : "text-gray-600"}`}>
          {isEnabled 
            ? "Status: Active. You will be prompted for an email code upon your next login." 
            : "Status: Inactive. Your account is currently secured by password only."}
        </p>
      </div>
    </div>
  );
}