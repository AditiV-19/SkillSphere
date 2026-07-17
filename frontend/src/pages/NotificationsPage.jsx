import { useNotification } from "../context/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Bell, CheckCheck, Trash2, BellRing, Circle } from "lucide-react";

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
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bell size={20} className="fill-blue-100" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {unreadCount > 0 ? (
                <span>
                  You have <strong className="text-blue-600">{unreadCount}</strong> unread notification{unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                "You are all caught up!"
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={readAllNotifications}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 active:scale-95"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-400">Loading your updates…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                <BellRing className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No notifications yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                When you get updates about your gigs, payments, or messages, they will show up right here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleItemClick(notification)}
                  className={`group relative cursor-pointer p-5 transition-all duration-200 hover:bg-slate-50 flex items-start gap-4 ${
                    notification.read ? "bg-white" : "bg-blue-50/30"
                  }`}
                >
                  {/* Unread Indicator */}
                  <div className="pt-1.5 shrink-0">
                    {notification.read ? (
                      <Circle size={10} className="text-slate-300/50 fill-slate-200" />
                    ) : (
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className={`text-sm mb-0.5 truncate ${notification.read ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm line-clamp-2 ${notification.read ? "text-slate-500" : "text-slate-600"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                      {notification.createdAt ? dayjs(notification.createdAt).fromNow() : ""}
                    </p>
                  </div>

                  {/* Delete Button - Subtle until hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification._id);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={18} />
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