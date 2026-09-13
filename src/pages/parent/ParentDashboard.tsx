import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Calendar, Clock, FileText, Bell, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { StudentFee, Student, Notice, Homework } from "../../types";

export default function ParentDashboard() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [pendingFees, setPendingFees] = useState<StudentFee[]>([]);
  const [noticesCount, setNoticesCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData?.uid) return;
      try {
        const studentsQ = query(collection(db, "students"), where("parentId", "==", userData.uid));
        const studentsSnap = await getDocs(studentsQ);
        const childrenData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setMyChildren(childrenData);
        
        if (childrenData.length > 0) {
          const childIds = childrenData.map(c => c.id);
          const schoolId = childrenData[0].schoolId;

          const feesQ = query(
            collection(db, "fees"),
            where("studentId", "in", childIds.slice(0, 10)),
            where("status", "in", ["PENDING", "PARTIAL", "OVERDUE"])
          );
          const feesSnap = await getDocs(feesQ);
          setPendingFees(feesSnap.docs.map(d => ({ id: d.id, ...d.data() } as StudentFee)));

          // Fetch notices
          const noticesQ = query(
            collection(db, "notices"),
            where("schoolId", "==", schoolId),
            where("status", "==", "PUBLISHED")
          );
          const noticesSnap = await getDocs(noticesQ);
          setNoticesCount(noticesSnap.size);

          // Fetch homework
          const hwQ = query(
            collection(db, "homework"),
            where("schoolId", "==", schoolId)
          );
          const hwSnap = await getDocs(hwQ);
          setHomeworkCount(hwSnap.size);
        }
      } catch (error) {
        console.error("Error fetching parent dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userData]);

  const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + fee.pendingAmount, 0);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {userData?.name}</h2>
          <p className="text-slate-500 mt-1">Here is your daily update from SchoolOS Academy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link to="/parent/fees" className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <CreditCard className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Pending Fees</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalPendingAmount.toLocaleString()}</p>
           {pendingFees.length > 0 && <p className="text-xs font-medium text-rose-500 mt-2">Due soon</p>}
        </Link>
        
        <Link to="/parent/attendance" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Calendar className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Attendance</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">View Logs</p>
           <p className="text-xs font-medium text-emerald-600 mt-2">Track daily presence</p>
        </Link>
        
        <Link to="/parent/notices" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Bell className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Notices</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">{noticesCount}</p>
           <p className="text-xs font-medium text-slate-400 mt-2">Total announcements</p>
        </Link>
        
        <Link to="/parent/homework" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <BookOpen className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Homework</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">{homeworkCount}</p>
           <p className="text-xs font-medium text-blue-600 mt-2">Pending assignments</p>
        </Link>

        <Link to="/parent/results" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <FileText className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Results</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">View Marks</p>
           <p className="text-xs font-medium text-fuchsia-600 mt-2">Latest exams</p>
        </Link>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">My Children</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myChildren.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-slate-500">No linked student accounts found.</div>
          ) : (
            myChildren.map(child => (
              <div key={child.id} className="p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-slate-200 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{child.name}</h4>
                  <p className="text-sm text-slate-500">Class {child.class} - {child.section}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
