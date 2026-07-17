import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { Trash2, Circle } from "lucide-react";

dayjs.extend(relativeTime);

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const { readNotification, removeNotification } = useNotification();

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
      className={`group relative cursor-pointer p-4 md:p-5 transition-all duration-200 hover:bg-slate-50 flex items-start gap-3 sm:gap-4 border-b border-slate-100 last:border-0 ${
        notification.read ? "bg-white" : "bg-blue-50/30"
      }`}
    >
      {/* Desktop Unread Indicator */}
      <div className="pt-1.5 shrink-0 hidden sm:block">
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
        <div className="flex items-center gap-2 mb-0.5">
          {/* Mobile Unread Indicator (shows as a simple dot on small screens) */}
          {!notification.read && (
            <span className="sm:hidden w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
          <h4
            className={`text-sm truncate ${
              notification.read
                ? "font-medium text-slate-700"
                : "font-semibold text-slate-900"
            }`}
          >
            {notification.title}
          </h4>
        </div>

        <p
          className={`text-sm line-clamp-2 ${
            notification.read ? "text-slate-500" : "text-slate-600"
          }`}
        >
          {notification.message}
        </p>

        <p className="text-xs font-medium text-slate-400 mt-2">
          {notification.createdAt
            ? dayjs(notification.createdAt).fromNow()
            : ""}
        </p>
      </div>

      {/* Delete Button - Subtle until hover on Desktop */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification._id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
        aria-label="Delete notification"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default NotificationItem;