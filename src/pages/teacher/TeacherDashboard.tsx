import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Teacher, Notice, Homework, AttendanceRecord } from "../../types";
import { Users, CalendarCheck, BookOpen, Bell, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeHomeworks, setActiveHomeworks] = useState<Homework[]>([]);
  const [pendingAttendance, setPendingAttendance] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userData?.uid || !userData?.schoolId) return;

      try {
        let foundTeacher = null;
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        
        if (teacherDoc.exists()) {
          foundTeacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        } else {
          // Fallback query for teachers created with the old addDoc bug
          const tQ = query(collection(db, "teachers"), where("email", "==", userData.email), where("schoolId", "==", userData.schoolId));
          const tSnap = await getDocs(tQ);
          if (!tSnap.empty) {
            foundTeacher = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Teacher;
          }
        }
        
        if (foundTeacher) {
          setTeacher(foundTeacher);
          
          // Check pending attendance for today
          const today = new Date().toISOString().split("T")[0];
          const attQ = query(
            collection(db, "attendance"),
            where("schoolId", "==", userData.schoolId),
            where("teacherId", "==", foundTeacher.id),
            where("date", "==", today)
          );
          const attSnap = await getDocs(attQ);
          const markedClasses = attSnap.docs.map(d => {
            const data = d.data();
            return `${data.class}-${data.section}`;
          });
          
          const pending = (foundTeacher.classes || []).filter(c => !markedClasses.includes(c));
          setPendingAttendance(pending);
        }

        // Fetch Recent Homework
        const hwQ = query(
          collection(db, "homework"),
          where("teacherId", "==", userData.uid)
        );
        const hwSnap = await getDocs(hwQ);
        const homeworks = hwSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Homework))
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
          .slice(0, 4);
        setActiveHomeworks(homeworks);

        // Fetch Notices
        const noticesQ = query(
          collection(db, "notices"),
          where("schoolId", "==", userData.schoolId),
          where("status", "==", "PUBLISHED"),
          where("audience", "in", ["ALL_TEACHERS", "ALL_STUDENTS"])
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {teacher.name}</h2>
          <p className="text-slate-500 mt-1">Subject: {teacher.subject || "Not assigned"} | {teacher.classes?.length || 0} Assigned Classes</p>
        </div>
        <div className="flex gap-3">
          <Link to="/teacher/attendance" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-100 transition-colors">
            <CalendarCheck className="w-4 h-4" />
            Attendance
          </Link>
          <Link to="/teacher/homework" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-100 transition-colors">
            <BookOpen className="w-4 h-4" />
            Homework
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Attendance */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Today's Attendance</h3>
              </div>
              <span className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="space-y-3">
              {teacher.classes?.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-2xl">
                  No classes assigned to you yet.
                </div>
              ) : pendingAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500" />
                  <p className="font-semibold">All done for today!</p>
                  <p className="text-sm opacity-80 text-center px-4 mt-1">You have marked attendance for all your assigned classes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teacher.classes?.map(c => {
                    const isPending = pendingAttendance.includes(c);
                    return (
                      <div key={c} className={`p-4 rounded-2xl border flex items-center justify-between ${isPending ? 'bg-orange-50/50 border-orange-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div>
                          <p className="font-bold text-slate-800">Class {c.replace('-', ' ')}</p>
                          <p className={`text-xs font-medium mt-0.5 ${isPending ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {isPending ? 'Pending' : 'Completed'}
                          </p>
                        </div>
                        {isPending ? (
                          <Link to={`/teacher/classes/${c}`} className="text-xs bg-white text-orange-600 px-3 py-1.5 rounded-lg border border-orange-200 font-medium hover:bg-orange-50 transition-colors">
                            Mark Now
                          </Link>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Homework */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Recent Assignments</h3>
              </div>
              <Link to="/teacher/homework" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View All
              </Link>
            </div>

            {activeHomeworks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                You haven't assigned any homework yet.
              </div>
            ) : (
              <div className="space-y-4">
                {activeHomeworks.map(hw => (
                  <div key={hw.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          {hw.class}-{hw.section}
                        </span>
                        <h4 className="font-bold text-slate-900">{hw.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{hw.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <Link to="/teacher/classes" className="bg-indigo-600 text-white p-6 rounded-3xl shadow-sm hover:shadow-md hover:bg-indigo-700 transition-all group block">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium opacity-90">My Classes</h3>
            <p className="text-3xl font-bold mt-1">{teacher.classes?.length || 0}</p>
            <div className="mt-4 flex items-center font-medium text-sm opacity-90 group-hover:opacity-100">
              Manage Students <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-800">School Notices</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {notices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm bg-slate-50">No new notices.</div>
              ) : (
                notices.map(notice => (
                  <div key={notice.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                    <div className="mt-2 text-[11px] font-medium text-slate-400">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
              <Link to="/teacher/notices" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View Notice Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
