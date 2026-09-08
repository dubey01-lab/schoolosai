import React, { useState, useEffect } from "react";
import { Bell, FileText, ChevronRight, MessageSquare, Loader2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notice } from "../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ParentNotices() {
  const { userData } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.schoolId) {
      fetchNotices();
    }
  }, [userData]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "notices"),
        where("schoolId", "==", userData!.schoolId),
        where("status", "==", "PUBLISHED")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
      
      data.sort((a, b) => new Date(b.publishDate || "").getTime() - new Date(a.publishDate || "").getTime());
      
      const parentNotices = data.filter(n => 
        n.audience === "ALL_PARENTS" || n.audience === "SPECIFIC_CLASS" || n.audience === "SPECIFIC_SECTION"
      );
      setNotices(parentNotices);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notices & Communications</h2>
        <p className="text-slate-500 mt-1">Stay updated with the latest announcements from the school.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {notices.length === 0 ? (
           <div className="p-12 text-center text-slate-500">No notices found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notices.map((notice) => (
              <div key={notice.id} className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600">
                     <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate text-slate-900">{notice.title}</h3>
                      </div>
                      <span className="text-xs font-medium text-slate-400 shrink-0">
                        {notice.publishDate ? format(new Date(notice.publishDate), "MMM d") : ""}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                        School Notice
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
