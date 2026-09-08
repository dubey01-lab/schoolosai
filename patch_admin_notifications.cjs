const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, MessageSquare, CreditCard, CalendarCheck, BookOpen, UserPlus, Trash2, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notification } from "../../types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function AdminNotifications() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState("ALL");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.schoolId && userData?.uid) {
      fetchNotifications();
    }
  }, [userData]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "notifications"),
        where("schoolId", "==", userData!.schoolId),
        where("userId", "==", userData!.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id!), { isRead: true })));
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const filteredNotifications = activeTab === "ALL" 
    ? notifications 
    : activeTab === "UNREAD" 
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === activeTab || (activeTab === "COMMUNICATION" && (n.type === "NOTICE" || n.type === "SYSTEM")));

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "UNREAD", label: "Unread" },
    { id: "SYSTEM", label: "System" },
    { id: "COMMUNICATION", label: "Communication" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTICE': return { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-100" };
      case 'FEE_REMINDER': return { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100" };
      case 'ATTENDANCE_ALERT': return { icon: CalendarCheck, color: "text-rose-600", bg: "bg-rose-100" };
      case 'HOMEWORK': return { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" };
      default: return { icon: Bell, color: "text-slate-600", bg: "bg-slate-200" };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-slate-500 mt-1">Manage your alerts and system messages.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 flex overflow-x-auto hide-scrollbar bg-slate-50/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors " + (
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
              <p className="text-slate-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { icon: Icon, color, bg } = getIcon(notification.type);
              return (
                <div 
                  key={notification.id} 
                  className={"p-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-4 group " + (!notification.isRead ? 'bg-indigo-50/30' : '')}
                  onClick={() => notification.id && markAsRead(notification.id)}
                >
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center shrink-0 " + bg}>
                    <Icon className={"w-6 h-6 " + color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={"text-sm font-semibold " + (!notification.isRead ? 'text-slate-900' : 'text-slate-700')}>
                        {notification.title}
                      </p>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={"text-sm mt-1 pr-8 " + (!notification.isRead ? 'text-slate-700 font-medium' : 'text-slate-500')}>
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mb-2"></div>
                    )}
                    <button 
                      onClick={(e) => deleteNotification(notification.id!, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AdminNotifications.tsx', content);
console.log('AdminNotifications updated');
