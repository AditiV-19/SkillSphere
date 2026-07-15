import { useState } from "react";

import { Bell } from "lucide-react";

import { useNotification } from "../../context/NotificationContext";

import NotificationDropdown from "./NotificationDropdown";
import { FaBell } from "react-icons/fa";

const NotificationBell = () => {

  const [open, setOpen] = useState(false);

  const { unreadCount } = useNotification();

  return (

    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-3 rounded-full bg-white shadow hover:bg-gray-100 transition"
      >

        <FaBell size={24}/>

        {unreadCount > 0 && (

          <span
            className="
            absolute
            -top-2
            -right-2
            bg-red-600
            text-white
            text-xs
            rounded-full
            w-5
            h-5
            flex
            items-center
            justify-center
            "
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>

        )}

      </button>

      {open && <NotificationDropdown />}

    </div>
  );
};

export default NotificationBell;