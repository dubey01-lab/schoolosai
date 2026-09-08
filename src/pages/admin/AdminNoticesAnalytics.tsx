import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notice } from "../../types";

export default function AdminNoticesAnalytics() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalNotices, setTotalNotices] = useState(0);
  const [parentsNotices, setParentsNotices] = useState(0);
  const [teachersNotices, setTeachersNotices] = useState(0);

  useEffect(() => {
    if (userData?.schoolId) fetchAnalytics();
  }, [userData]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notices"), where("schoolId", "==", userData!.schoolId));
      const snap = await getDocs(q);
      const notices = snap.docs.map(d => d.data() as Notice);
      
      setTotalNotices(notices.length);
      setParentsNotices(notices.filter(n => n.audience === "ALL_PARENTS").length);
      setTeachersNotices(notices.filter(n => n.audience === "ALL_TEACHERS").length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  const parentPct = totalNotices > 0 ? Math.round((parentsNotices / totalNotices) * 100) : 0;
  const teacherPct = totalNotices > 0 ? Math.round((teachersNotices / totalNotices) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/notices" className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Communication Analytics</h2>
          <p className="text-slate-500 mt-1">Track the engagement and delivery metrics for your notices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{totalNotices}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Total Notices Sent</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{parentsNotices}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Targeted at Parents</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100">
              <CheckCircle2 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{teachersNotices}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Targeted at Teachers</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[300px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Audience Distribution</h3>
        {totalNotices === 0 ? (
          <div className="text-center text-slate-500 py-12">No data available</div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Parents</span>
                <span className="font-bold text-slate-900">{parentPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${parentPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Teachers</span>
                <span className="font-bold text-slate-900">{teacherPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${teacherPct}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
