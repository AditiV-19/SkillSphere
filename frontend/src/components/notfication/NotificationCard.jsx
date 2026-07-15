import React from "react";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";

const NotificationCard = ({ notification }) => {
  const { readNotification, removeNotification } = useNotification();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!notification.read) {
      await readNotification(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
        notification.read
          ? "bg-white hover:bg-slate-50"
          : "bg-blue-50/30 hover:bg-blue-50/60"
      }`}
    >
      {/* 1. Professional Unread Accent Line */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
      )}

      {/* 2. Status Icon (Changes color based on read status) */}
      <div
        className={`mt-0.5 shrink-0 p-2 rounded-full ${
          notification.read
            ? "bg-slate-100 text-slate-400"
            : "bg-blue-100 text-blue-600"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>

      {/* 3. Typography Updates */}
      <div className="flex-1 min-w-0 pr-8">
        <h4
          className={`text-sm font-semibold truncate ${
            notification.read ? "text-slate-700" : "text-blue-950"
          }`}
        >
          {notification.title}
        </h4>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* 4. Refined Delete Button (Appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification._id);
        }}
        className="absolute right-4 top-4 p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
        aria-label="Delete notification"
        title="Delete"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default NotificationCard;
