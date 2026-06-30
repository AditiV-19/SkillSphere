import { sidebarMenus } from "../data/sidebarMenus";
import { useNavigate, useLocation } from "react-router-dom";

import { FaSignOutAlt } from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
const location = useLocation();

const user = JSON.parse(localStorage.getItem("user"));

const role = user?.role || "freelancer";

const menuItems = sidebarMenus[role];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">

      <div className="px-8 py-7 border-b">
        <h1 className="text-3xl font-bold text-blue-600">
          SkillSphere
        </h1>
      </div>

      <nav className="flex-1 p-4">

        <ul className="space-y-2">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <li
                    key={item.label}
    onClick={() => navigate(item.route)}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
        location.pathname === item.route
            ? "bg-blue-600 text-white"
            : "hover:bg-blue-50 hover:text-blue-600"
    }`} >
                <Icon size={18} />

                <span className="font-medium">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">

        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition">

          <FaSignOutAlt />

          Logout

        </button>

      </div>

    </aside>
  );
}