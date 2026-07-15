import React from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = () => {
  const { notifications, readAllNotifications, unreadCount } = useNotification();

  return (
    <div
      className="
        absolute right-0 mt-3
        w-80 sm:w-96
        bg-white
        rounded-xl
        shadow-xl shadow-slate-200/50
        ring-1 ring-slate-900/5
        z-50
        overflow-hidden
        flex flex-col
      "
    >
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
        <h3 className="font-semibold text-slate-800">Notifications</h3>

        {unreadCount > 0 && (
          <button
            onClick={readAllNotifications}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 hover:bg-blue-50 rounded-md"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-slate-50 p-3 rounded-full mb-3">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for new updates.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}
          </div>
        )}

        <Link
          to="/notifications"
          className="block text-center p-3 text-sm font-medium text-slate-600 border-t hover:bg-slate-50"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;