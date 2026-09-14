const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Users, CalendarCheck, BookOpen, Bell, CheckCircle2, Clock, FileText, LayoutDashboard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedStudents: 0,
    pendingAttendance: 0,
    pendingHomework: 0,
    upcomingExams: 0,
  });
  const [teacher, setTeacher] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [activeClasses, setActiveClasses] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userData?.schoolId || !userData?.uid) return;
      try {
        let tData = null;
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        if (teacherDoc.exists()) {
          tData = { id: teacherDoc.id, ...teacherDoc.data() };
        } else {
          const tQ = query(collection(db, "teachers"), where("email", "==", userData.email), where("schoolId", "==", userData.schoolId));
          const tSnap = await getDocs(tQ);
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() };
        }
        
        setTeacher(tData);

        const schoolDoc = await getDoc(doc(db, "schools", userData.schoolId));
        if (schoolDoc.exists()) setSchool(schoolDoc.data());

        const classes = tData?.classes || [];
        setActiveClasses(classes);

        // Fetch students
        let studentCount = 0;
        if (classes.length > 0) {
          for (const cls of classes) {
            const [c, s] = cls.split("-");
            const sq = query(collection(db, "students"), where("schoolId", "==", userData.schoolId), where("class", "==", c), where("section", "==", s));
            const snap = await getDocs(sq);
            studentCount += snap.size;
          }
        }

        // Fetch attendance to calculate pending
        const today = new Date().toISOString().split("T")[0];
        let attendancePending = classes.length;
        if (tData?.id) {
          const attQ = query(collection(db, "attendance"), where("schoolId", "==", userData.schoolId), where("teacherId", "==", tData.id), where("date", "==", today));
          const attSnap = await getDocs(attQ);
          attendancePending -= attSnap.size;
        }
        if (attendancePending < 0) attendancePending = 0;

        // Fetch homework
        const hwQ = query(collection(db, "homework"), where("schoolId", "==", userData.schoolId), where("teacherId", "==", tData?.id || ""), where("status", "in", ["ACTIVE", "PUBLISHED"]));
        const hwSnap = await getDocs(hwQ);
        const pendingHw = hwSnap.size;

        // Fetch exams
        const exQ = query(collection(db, "exams"), where("schoolId", "==", userData.schoolId));
        const exSnap = await getDocs(exQ);
        // just a general count of exams for now
        const upcomingEx = exSnap.size;

        setStats({
          assignedStudents: studentCount,
          pendingAttendance: attendancePending,
          pendingHomework: pendingHw,
          upcomingExams: upcomingEx
        });

        // Fetch notices
        const nQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId));
        const nSnap = await getDocs(nQ);
        setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [userData]);

  if (loading) return <div className="p-12 text-center text-slate-500 flex flex-col items-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>Loading Dashboard...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {teacher?.name || userData?.name}!</h1>
            <p className="text-indigo-200 text-lg">{school?.name || "Your School"} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/teacher/attendance" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-white/10">
              <CalendarCheck className="w-4 h-4" /> Mark Attendance
            </Link>
            <Link to="/teacher/homework" className="bg-white text-indigo-900 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <BookOpen className="w-4 h-4" /> Assign Homework
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Students</p>
            <p className="text-2xl font-bold text-slate-900">{stats.assignedStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Attendance</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingAttendance} Classes</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Homework</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingHomework}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming Exams</p>
            <p className="text-2xl font-bold text-slate-900">{stats.upcomingExams}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/teacher/classes" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                <Users className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">View Students</span>
              </Link>
              <Link to="/teacher/marks" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Enter Marks</span>
              </Link>
              <Link to="/teacher/notices" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                <Bell className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Create Notice</span>
              </Link>
              <Link to="/teacher/progress" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
                <CheckCircle2 className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-900">Class Progress</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Classes</h3>
            {activeClasses.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
                You have no assigned classes.
              </div>
            ) : (
              <div className="space-y-4">
                {activeClasses.map(cls => (
                  <div key={cls} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {cls.split('-')[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Class {cls.replace('-', ' Section ')}</h4>
                        <p className="text-sm text-slate-500">{teacher?.subject || 'General'}</p>
                      </div>
                    </div>
                    <Link to="/teacher/classes" className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Recent Notices</h3>
              <Link to="/teacher/notices" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {notices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No notices available.</div>
              ) : (
                notices.map(notice => (
                  <div key={notice.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                    <p className="text-[11px] text-slate-400 mt-2">{new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherDashboard.tsx', content);
