import { useNotification } from "../context/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

dayjs.extend(relativeTime);

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    readNotification,
    readAllNotifications,
    removeNotification,
  } = useNotification();

  const navigate = useNavigate();

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      await readNotification(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                You have {unreadCount} unread notification
                {unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={readAllNotifications}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 hover:bg-blue-50 rounded-md"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl ring-1 ring-slate-900/5 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-sm text-slate-400">Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
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
              <p className="text-sm font-medium text-slate-600">
                You're all caught up!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Check back later for new updates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleItemClick(notification)}
                  className={`cursor-pointer p-4 hover:bg-slate-50 transition flex justify-between gap-3 ${
                    notification.read ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <h4 className="font-semibold text-slate-800 truncate">
                        {notification.title}
                      </h4>
                    </div>

                    <p className="text-sm text-slate-600 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {notification.createdAt
                        ? dayjs(notification.createdAt).fromNow()
                        : ""}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification._id);
                    }}
                    className="text-red-500 hover:text-red-700 shrink-0 h-fit"
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
