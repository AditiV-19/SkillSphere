import { sidebarMenus } from "../data/sidebarMenus";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaSignOutAlt, FaColumns } from "react-icons/fa";
import { logoutUser } from "../services/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toggleSidebar, setToggleSidebar] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "freelancer";
  const menuItems = sidebarMenus[role];

  const handleLogout = async () => {
  try {
    await logoutUser()
    localStorage.removeItem('user');
    navigate('/');
  } catch (error) {
    console.error("Failed to log out", error);
  }
};

  return (
    // 1. Added transition-all and dynamic width based on state
    <aside className={`${toggleSidebar ? "w-64" : "w-24"} h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      
      <div className="px-6 py-7 border-b flex items-center justify-between">
        {/* Only show Title when sidebar is open */}
        {toggleSidebar && <h1 className="text-2xl font-bold text-blue-600">SkillSphere</h1>}
        <button onClick={() => setToggleSidebar(!toggleSidebar)} className="text-gray-500 hover:text-blue-600 transition ml-4 text-xl">
           {toggleSidebar ? <FaColumns /> : <FaColumns />}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`flex items-center ${toggleSidebar ? "gap-4" : "justify-center"} px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  location.pathname === item.route
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon size={18} />
                {/* 2. Hide text when toggled */}
                {toggleSidebar && <span className="font-medium">{item.label}</span>}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button className={`w-full flex items-center ${toggleSidebar ? "gap-4" : "justify-center"} px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition`}
        onClick={handleLogout}
        >
          <FaSignOutAlt />
          {toggleSidebar && "Logout"}
        </button>
      </div>
    </aside>
  );
}