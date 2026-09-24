import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  ExternalLink,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../services/api/notification.api";
import { useRealtime } from "../../hooks/useRealtime";

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for realtime incoming notifications
  useRealtime({
    NOTIFICATION_RECEIVED: (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.data?.link) {
      navigate(notif.data.link);
    } else if (notif.entityType && notif.entityId) {
      if (notif.entityType === "ProduceLot") navigate("/officer/lots");
      else if (notif.entityType === "PurchaseOrder") navigate("/buyer/orders");
      else if (notif.entityType === "Shipment") navigate("/logistics");
      else if (notif.entityType === "Settlement") navigate("/settlements");
      else navigate("/notifications");
    } else {
      navigate("/notifications");
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "HIGH":
        return <AlertTriangle size={15} className="text-orange-400 shrink-0" />;
      case "MEDIUM":
        return <Info size={15} className="text-indigo-400 shrink-0" />;
      default:
        return <AlertCircle size={15} className="text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white relative cursor-pointer transition-colors shadow-inner"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/40">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-800/70 cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.isRead ? "bg-emerald-950/15" : ""
                  }`}
                >
                  <div className="mt-0.5">{getPriorityIcon(n.priority)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p
                        className={`text-xs font-semibold line-clamp-1 ${!n.isRead ? "text-white" : "text-slate-300"}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                {loading ? "Loading notifications..." : "No notifications yet."}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-950/60 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white py-1 w-full flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View All Notifications</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
