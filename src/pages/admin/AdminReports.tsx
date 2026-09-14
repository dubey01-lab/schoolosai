import { Download } from "lucide-react";
import { downloadCSV } from "../../lib/exportUtils";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart, Users, CalendarCheck, CreditCard, UserPlus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart as RechartsBarChart } from "recharts";

export default function AdminReports() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmissions: 0,
    activeAdmissions: 0,
    totalFees: 0,
    collectedFees: 0,
    pendingFees: 0,
  });

  const [admissionData, setAdmissionData] = useState<any[]>([]);

  
  const [exporting, setExporting] = useState(false);

  const exportAttendance = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "attendance"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          Date: d.date,
          Class: d.class,
          Section: d.section,
          TeacherId: d.teacherId,
          TotalRecords: d.records?.length || 0,
        };
      });
      if (data.length === 0) { toast.error("No attendance records found"); return; }
      downloadCSV(data, "Attendance_Report.csv");
      toast.success("Attendance report exported");
    } catch (e) {
      toast.error("Error exporting attendance");
    } finally {
      setExporting(false);
    }
  };

  const exportAcademic = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "results"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          StudentId: d.studentId,
          ExamId: d.examId,
          Total: d.total,
          Percentage: d.percentage,
          Grade: d.grade,
        };
      });
      if (data.length === 0) { toast.error("No academic records found"); return; }
      downloadCSV(data, "Academic_Report.csv");
      toast.success("Academic report exported");
    } catch (e) {
      toast.error("Error exporting academic");
    } finally {
      setExporting(false);
    }
  };

  const exportFees = async () => {
    setExporting(true);
    try {
      const q = query(collection(db, "fees"), where("schoolId", "==", userData?.schoolId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          StudentId: d.studentId,
          AcademicYear: d.academicYear,
          TotalAmount: d.totalAmount,
          PaidAmount: d.paidAmount,
          PendingAmount: d.pendingAmount,
          Status: d.status,
          DueDate: d.dueDate,
        };
      });
      if (data.length === 0) { toast.error("No fee records found"); return; }
      downloadCSV(data, "Fee_Report.csv");
      toast.success("Fee report exported");
    } catch (e) {
      toast.error("Error exporting fees");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      if (!userData?.schoolId) return;
      try {
        // Students
        const studentsSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", userData.schoolId)));
        const studentsCount = studentsSnap.size;

        // Teachers
        const teachersSnap = await getDocs(query(collection(db, "teachers"), where("schoolId", "==", userData.schoolId)));
        const teachersCount = teachersSnap.size;

        // Admissions
        const admissionsSnap = await getDocs(query(collection(db, "admissions"), where("schoolId", "==", userData.schoolId)));
        let activeAdmin = 0;
        const adminStatusCounts: Record<string, number> = { "NEW": 0, "CONTACTED": 0, "INTERESTED": 0, "ADMISSION": 0, "NOT_INTERESTED": 0 };
        
        admissionsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.status !== "NOT_INTERESTED" && data.status !== "ADMISSION") {
            activeAdmin++;
          }
          if (adminStatusCounts[data.status] !== undefined) {
            adminStatusCounts[data.status]++;
          }
        });

        const formattedAdmissionData = [
          { name: 'New', count: adminStatusCounts["NEW"] },
          { name: 'Contacted', count: adminStatusCounts["CONTACTED"] },
          { name: 'Interested', count: adminStatusCounts["INTERESTED"] },
          { name: 'Admitted', count: adminStatusCounts["ADMISSION"] },
        ];

        // Fees
        const feesSnap = await getDocs(query(collection(db, "fees"), where("schoolId", "==", userData.schoolId)));
        let tFees = 0, cFees = 0, pFees = 0;
        feesSnap.docs.forEach(doc => {
          const data = doc.data();
          tFees += data.totalAmount || 0;
          cFees += data.paidAmount || 0;
          pFees += data.pendingAmount || 0;
        });

        setStats({
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          totalAdmissions: admissionsSnap.size,
          activeAdmissions: activeAdmin,
          totalFees: tFees,
          collectedFees: cFees,
          pendingFees: pFees,
        });

        setAdmissionData(formattedAdmissionData);
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userData]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading reports...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">School Reports</h2>
          <p className="text-slate-500 mt-1">Overview of school performance and metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Students</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Teachers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalTeachers}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Active Enquiries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeAdmissions}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Pending Fees</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.pendingFees.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fee Collection Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-600">Total Expected</span>
                <span className="text-slate-900">₹{stats.totalFees.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-emerald-600">Collected</span>
                <span className="text-emerald-700">₹{stats.collectedFees.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: stats.totalFees ? `${(stats.collectedFees/stats.totalFees)*100}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-rose-600">Pending</span>
                <span className="text-rose-700">₹{stats.pendingFees.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: stats.totalFees ? `${(stats.pendingFees/stats.totalFees)*100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Admissions Pipeline</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={admissionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Data Export</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={exportAttendance} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Attendance
          </button>
          <button onClick={exportAcademic} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Academic
          </button>
          <button onClick={exportFees} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors">
            <Download className="w-5 h-5" /> Export Fees
          </button>
        </div>
      </div>
    </div>
  );
}
