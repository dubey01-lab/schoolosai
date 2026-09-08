import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Eye, Download, UserCircle, Send, AlertCircle, Edit2, Trash2, CalendarClock } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Notice } from "../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminNoticeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "notices", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNotice({ id: docSnap.id, ...docSnap.data() } as Notice);
        } else {
          toast.error("Notice not found");
          navigate("/admin/notices");
        }
      } catch (error) {
        console.error("Error fetching notice:", error);
        toast.error("Failed to load notice");
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteDoc(doc(db, "notices", id!));
        toast.success("Notice deleted");
        navigate("/admin/notices");
      } catch (error) {
        toast.error("Failed to delete notice");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!notice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/notices" className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Notice Details</h2>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors flex items-center gap-2">
             <Edit2 className="w-4 h-4" /> Edit
           </button>
           <button onClick={handleDelete} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-medium transition-colors flex items-center gap-2">
             <Trash2 className="w-4 h-4" /> Delete
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
         {/* Status Header */}
         <div className={"px-6 py-4 flex items-center gap-3 " + (notice.status === 'PUBLISHED' ? 'bg-emerald-50 border-b border-emerald-100' : notice.status === 'SCHEDULED' ? 'bg-amber-50 border-b border-amber-100' : 'bg-slate-50 border-b border-slate-100')}>
            {notice.status === 'PUBLISHED' && <Send className="w-5 h-5 text-emerald-600" />}
            {notice.status === 'SCHEDULED' && <CalendarClock className="w-5 h-5 text-amber-600" />}
            {notice.status === 'DRAFT' && <Edit2 className="w-5 h-5 text-slate-600" />}
            <div>
              <p className={"font-semibold " + (notice.status === 'PUBLISHED' ? 'text-emerald-800' : notice.status === 'SCHEDULED' ? 'text-amber-800' : 'text-slate-800')}>
                {notice.status}
              </p>
              <p className={"text-xs " + (notice.status === 'PUBLISHED' ? 'text-emerald-600' : notice.status === 'SCHEDULED' ? 'text-amber-600' : 'text-slate-500')}>
                {notice.status === 'PUBLISHED' ? 'Published on ' + format(new Date(notice.publishDate || notice.createdAt), 'MMM d, yyyy h:mm a') : 
                 notice.status === 'SCHEDULED' ? 'Scheduled for ' + format(new Date(notice.scheduledDate!), 'MMM d, yyyy h:mm a') : 
                 'Last edited on ' + format(new Date(notice.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
         </div>

         <div className="p-6 md:p-8 space-y-8">
           {/* Meta Data */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Author</p>
               <div className="flex items-center gap-2">
                 <UserCircle className="w-5 h-5 text-slate-400" />
                 <span className="font-medium text-slate-900">{notice.authorName}</span>
               </div>
             </div>
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Audience</p>
               <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                 {notice.audience.replace('_', ' ').toLowerCase()}
               </span>
             </div>
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Views</p>
               <div className="flex items-center gap-2">
                 <Eye className="w-5 h-5 text-slate-400" />
                 <span className="font-medium text-slate-900">{notice.status === 'PUBLISHED' ? '24' : '0'}</span>
               </div>
             </div>
           </div>

           {/* Content */}
           <div className="border-t border-slate-100 pt-8">
             <h1 className="text-3xl font-bold text-slate-900 mb-6">{notice.title}</h1>
             <div className="prose prose-slate max-w-none">
               <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
