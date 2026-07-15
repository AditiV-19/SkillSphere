import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";

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
      className={`cursor-pointer border-b p-4 hover:bg-gray-50 transition ${
        notification.read ? "bg-white" : "bg-blue-50"
      }`}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          <h4 className="font-semibold">{notification.title}</h4>

          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>

          <p className="text-xs text-gray-400 mt-2">
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
          className="ml-3 text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;