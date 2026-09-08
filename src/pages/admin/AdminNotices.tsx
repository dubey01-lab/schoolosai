import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Bell, MessageSquare, Send, Sparkles, MoreVertical, Eye, Edit2, Trash2, CalendarClock, Copy, Archive, BarChart3, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notice } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminNotices() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchNotices();
  }, [userData?.schoolId]);

  const fetchNotices = async () => {
    if (!userData?.schoolId) return;
    try {
      const q = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId));
      const querySnapshot = await getDocs(q);
      const noticesData: Notice[] = [];
      querySnapshot.forEach((doc) => {
        noticesData.push({ id: doc.id, ...doc.data() } as Notice);
      });
      setNotices(noticesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteDoc(doc(db, "notices", id));
        setNotices(notices.filter(n => n.id !== id));
        toast.success("Notice deleted");
      } catch (error) {
        toast.error("Failed to delete notice");
      }
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || n.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: notices.length,
    published: notices.filter(n => n.status === "PUBLISHED").length,
    scheduled: notices.filter(n => n.status === "SCHEDULED").length,
    drafts: notices.filter(n => n.status === "DRAFT").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notices & Communications</h2>
          <p className="text-slate-500 mt-1">Create, schedule and manage communication with your school community.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link 
            to="/admin/notices/analytics"
            className="flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-slate-200 shadow-sm"
          >
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Analytics
          </Link>
          <Link 
            to="/admin/notices/ai"
            className="flex-1 sm:flex-none bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-indigo-200 shadow-sm"
          >
            <Sparkles className="w-5 h-5" /> AI Generate
          </Link>
          <Link 
            to="/admin/notices/create"
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" /> Create Notice
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Notices", value: stats.total, icon: MessageSquare, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Published", value: stats.published, icon: Send, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Scheduled", value: stats.scheduled, icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Drafts", value: stats.drafts, icon: Edit2, color: "text-slate-500", bg: "bg-slate-200" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
               </div>
               <div className={"w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 " + stat.bg}>
                 <stat.icon className={"w-6 h-6 " + stat.color} />
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DRAFT">Drafts</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No notices found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">You haven't created any notices matching this filter yet.</p>
              <Link 
                to="/admin/notices/create"
                className="mt-6 text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Create Notice
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="px-6 py-4 w-[40%]">Notice</th>
                  <th className="px-6 py-4">Audience</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">{notice.title}</p>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">By {notice.authorName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {notice.audience.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium " + (
                        notice.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 
                        notice.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                        notice.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-700' :
                        'bg-slate-100 text-slate-600'
                      )}>
                        {notice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(notice.status === 'SCHEDULED' ? notice.scheduledDate! : notice.publishDate || notice.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={"/admin/notices/" + notice.id} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(notice.id!)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
