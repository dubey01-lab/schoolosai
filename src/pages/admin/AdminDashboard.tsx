import { downloadCSV } from "../../lib/exportUtils";
import React, { useState, useEffect } from "react";
import { Users, CreditCard, CalendarCheck, Clock, UserCheck, FileText, BarChart, UserPlus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Student, Teacher, AdmissionEnquiry, StudentFee, AttendanceRecord } from "../../types";

export default function AdminDashboard() {
  const { userData } = useAuth();

  const handleExport = () => {
    const data = [
      { Metric: "Total Students", Value: stats.students },
      { Metric: "Total Teachers", Value: stats.teachers },
      { Metric: "Total Fees", Value: stats.feesCollected }
    ];
    downloadCSV(data, `dashboard_report_${new Date().getTime()}.csv`);
  };

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    newAdmissions: 0,
    feesCollected: 0,
    feesPending: 0,
  });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const schoolName = userData?.schoolId ? userData.schoolId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "your school";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData?.schoolId) return;
      try {
        const studentsSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", userData.schoolId)));
        const teachersSnap = await getDocs(query(collection(db, "teachers"), where("schoolId", "==", userData.schoolId)));
        
        const adminQ = query(collection(db, "admissions"), where("schoolId", "==", userData.schoolId), where("status", "in", ["NEW", "CONTACTED", "INTERESTED"]));
        const adminSnap = await getDocs(adminQ);
        
        const feesSnap = await getDocs(query(collection(db, "fees"), where("schoolId", "==", userData.schoolId)));
        let collected = 0;
        let pending = 0;
        feesSnap.forEach(doc => {
          const data = doc.data() as StudentFee;
          collected += data.paidAmount || 0;
          pending += data.pendingAmount || 0;
        });

        setStats({
          students: studentsSnap.size,
          teachers: teachersSnap.size,
          newAdmissions: adminSnap.size,
          feesCollected: collected,
          feesPending: pending,
        });

        // Try to fetch last 5 days of attendance
        const attQ = query(collection(db, "attendance"), where("schoolId", "==", userData.schoolId), orderBy("date", "desc"), limit(10));
        const attSnap = await getDocs(attQ);
        const dayMap: Record<string, { present: number, total: number }> = {};
        
        attSnap.docs.forEach(doc => {
          const data = doc.data() as AttendanceRecord;
          if (!dayMap[data.date]) dayMap[data.date] = { present: 0, total: 0 };
          
          data.records.forEach(r => {
            dayMap[data.date].total++;
            if (r.status === "PRESENT") dayMap[data.date].present++;
          });
        });

        const attChart = Object.keys(dayMap).sort().map(date => {
          const d = dayMap[date];
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            present: Math.round((d.present / (d.total || 1)) * 100)
          };
        });

        if (attChart.length === 0) {
          setAttendanceData([
            { name: "Mon", present: 0 }, { name: "Tue", present: 0 }, { name: "Wed", present: 0 },
            { name: "Thu", present: 0 }, { name: "Fri", present: 0 }
          ]);
        } else {
          setAttendanceData(attChart);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userData]);

  const statCards = [
    { name: "Total Students", value: stats.students, trend: "Active", icon: Users, color: "text-indigo-600", bg: "bg-indigo-100", link: "/admin/students" },
    { name: "Teachers", value: stats.teachers, trend: "Active", icon: Users, color: "text-emerald-600", bg: "bg-emerald-100", link: "/admin/teachers" },
    { name: "Admissions", value: stats.newAdmissions, trend: "Pipeline", icon: UserPlus, color: "text-amber-600", bg: "bg-amber-100", link: "/admin/admissions" },
    { name: "Fees Collected", value: `₹${stats.feesCollected.toLocaleString()}`, trend: "Received", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-100", link: "/admin/fees" },
    { name: "Fees Pending", value: `₹${stats.feesPending.toLocaleString()}`, trend: "Outstanding", icon: Clock, color: "text-rose-600", bg: "bg-rose-100", link: "/admin/fees/pending" },
  ];

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Good morning, {userData?.name?.split(' ')[0] || "Principal"} 👋</h2>
          <p className="text-slate-500 mt-1">Here's what's happening at {schoolName} today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Download Report</button>
        </div>
      </div>

      {stats.students === 0 && stats.teachers === 0 && (
        <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-2">Welcome to your new school workspace!</h3>
            <p className="text-indigo-200 text-sm">Your school is ready. Complete these quick steps to get started.</p>
            <div className="flex gap-4 mt-4 text-sm font-medium">
              <span className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"><UserCheck className="w-3 h-3" /></div> School Profile</span>
              <span className="flex items-center gap-1.5 opacity-50"><div className="w-5 h-5 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">2</div> Add Teachers</span>
              <span className="flex items-center gap-1.5 opacity-50"><div className="w-5 h-5 rounded-full bg-indigo-800 flex items-center justify-center border border-indigo-700">3</div> Add Students</span>
            </div>
          </div>
          <Link to="/admin/settings" className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap">
            Continue Setup
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={"w-12 h-12 rounded-xl " + stat.bg + " flex items-center justify-center"}>
                <stat.icon className={"w-6 h-6 " + stat.color} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={"font-medium " + (stat.trend === 'Active' ? 'text-emerald-600' : 'text-slate-500')}>
                {stat.trend}
              </span>
              <span className="text-slate-400">Current</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Attendance Overview (%)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="present" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Academic Overview</h3>
              <Link to="/admin/exams" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Exams</Link>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Set Up Classes</h4>
                  <p className="text-sm text-slate-500">Add classes, sections, and subjects.</p>
                </div>
                <Link to="/admin/classes" className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full hover:bg-indigo-200">MANAGE</Link>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Add Students</h4>
                  <p className="text-sm text-slate-500">Enroll your first batch of students.</p>
                </div>
                <Link to="/admin/students" className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full hover:bg-indigo-200">ADD</Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "Add Student", icon: UserPlus, link: "/admin/students" },
                { name: "Mark Attendance", icon: UserCheck, link: "/admin/attendance" },
                { name: "Create Notice", icon: FileText, link: "/admin/notices/create" },
                { name: "Admissions", icon: UserPlus, link: "/admin/admissions" },
                { name: "Exams", icon: FileText, link: "/admin/exams" },
                { name: "Reports", icon: BarChart, link: "/admin/reports" },
              ].map((action) => (
                <Link to={action.link} key={action.name} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-100 group">
                  <action.icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700 text-center">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
