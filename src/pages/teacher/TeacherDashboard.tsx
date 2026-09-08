import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Teacher, Notice } from "../../types";
import { Users, CalendarCheck, BookOpen, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userData?.uid || !userData?.schoolId) return;
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        if (teacherDoc.exists()) {
          setTeacher({ id: teacherDoc.id, ...teacherDoc.data() } as Teacher);
        }

        const noticesQ = query(
          collection(db, "notices"),
          where("schoolId", "==", userData.schoolId),
          where("status", "==", "PUBLISHED"),
          where("audience", "in", ["ALL_TEACHERS", "ALL_STUDENTS"]) // Simplification
        );
        const noticesSnap = await getDocs(noticesQ);
        const fetchedNotices = noticesSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Notice))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setNotices(fetchedNotices);
      } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userData]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading workspace...</div>;
  if (!teacher) return <div className="p-8 text-center text-slate-500">Teacher profile not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {teacher.name}</h2>
          <p className="text-slate-500">Subject: {teacher.subject || "Not assigned"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/teacher/classes" className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-slate-500">Assigned Classes</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{teacher.classes?.length || 0}</p>
          <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
            View Classes <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link to="/teacher/attendance" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-slate-500">Quick Action</h3>
          <p className="text-xl font-bold text-slate-900 mt-1">Mark Attendance</p>
          <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm">
            Open Register <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link to="/teacher/homework" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-slate-500">Quick Action</h3>
          <p className="text-xl font-bold text-slate-900 mt-1">Assign Homework</p>
          <div className="mt-4 flex items-center text-amber-600 font-medium text-sm">
            Create Assignment <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-800">Recent Notices</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {notices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No new notices.</div>
          ) : (
            notices.map(notice => (
              <div key={notice.id} className="p-6 hover:bg-slate-50 transition-colors">
                <h4 className="font-bold text-slate-900">{notice.title}</h4>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                <div className="mt-3 text-xs text-slate-500">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
