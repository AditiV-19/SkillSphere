import { createContext, useContext, useEffect, useState, useRef } from "react";
import socket from "../services/socket";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // avoid re-registering the socket listener on every render
  const listenerAttached = useRef(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token || !user) return;

    loadNotifications();
    connectSocket();

    return () => {
      socket.off("newNotification");
      socket.disconnect();
      listenerAttached.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const [notificationRes, unreadRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(notificationRes.data.notifications);
      setUnreadCount(unreadRes.data.count);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socket.connect();

    const userId = user?._id || user?.id;
    socket.emit("registerUser", userId);

    if (listenerAttached.current) return;
    listenerAttached.current = true;

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  };

  const readNotification = async (id) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.log(err);
    }
  };

  const readAllNotifications = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        readNotification,
        readAllNotifications,
        removeNotification,
        reloadNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);