import React, { useState, useEffect } from "react";
import { Download, Filter, Printer, BarChart3, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { StudentFee, Student } from "../../types";

export default function AdminFeeReports() {
  const { userData } = useAuth();
  const [reportType, setReportType] = useState("COLLECTION");
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.schoolId) fetchReportData();
  }, [userData]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const fSnap = await getDocs(query(collection(db, "fees"), where("schoolId", "==", userData!.schoolId)));
      const fData = fSnap.docs.map(d => ({ id: d.id, ...d.data() } as StudentFee));
      setFees(fData);

      const sSnap = await getDocs(query(collection(db, "students"), where("schoolId", "==", userData!.schoolId)));
      const sMap: Record<string, Student> = {};
      sSnap.docs.forEach(d => {
        sMap[d.id] = { id: d.id, ...d.data() } as Student;
      });
      setStudents(sMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: "COLLECTION", name: "Fee Collection", description: "View all fee structures and collected amounts.", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: "OVERDUE", name: "Overdue Report", description: "Detailed list of students with overdue payments.", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
    { id: "DISCOUNT", name: "Discounts & Scholarships", description: "Summary of all fee waivers provided.", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  let displayData = fees;
  if (reportType === "OVERDUE") displayData = fees.filter(f => (f.pendingAmount || 0) > 0);
  if (reportType === "DISCOUNT") displayData = fees.filter(f => (f.discountAmount || 0) > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fee Reports</h2>
          <p className="text-slate-500 mt-1">Generate and export detailed financial analytics.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-3">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setReportType(report.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                reportType === report.id 
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${reportType === report.id ? 'bg-indigo-600 text-white' : report.bg}`}>
                  <report.icon className={`w-4 h-4 ${reportType === report.id ? 'text-white' : report.color}`} />
                </div>
                <span className={`font-semibold ${reportType === report.id ? 'text-indigo-900' : 'text-slate-800'}`}>{report.name}</span>
              </div>
              <p className={`text-xs ${reportType === report.id ? 'text-indigo-700' : 'text-slate-500'}`}>{report.description}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {reports.find(r => r.id === reportType)?.name}
                </h3>
              </div>
            </div>

            <div className="flex-1 p-0 overflow-x-auto">
              {loading ? (
                 <div className="p-12 flex justify-center items-center">
                   <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                 </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      <th className="px-6 py-4 text-right">Paid</th>
                      <th className="px-6 py-4 text-right">Pending</th>
                      {reportType === "DISCOUNT" && <th className="px-6 py-4 text-right">Discount</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayData.map(f => {
                      const student = students[f.studentId];
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-900">{student?.name || "Unknown"}</td>
                          <td className="px-6 py-4 text-slate-600">{student?.class} - {student?.section}</td>
                          <td className="px-6 py-4 text-right font-medium">₹{(f.totalAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-emerald-600">₹{(f.paidAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-rose-600">₹{(f.pendingAmount || 0).toLocaleString()}</td>
                          {reportType === "DISCOUNT" && <td className="px-6 py-4 text-right text-amber-600">₹{(f.discountAmount || 0).toLocaleString()}</td>}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              {!loading && displayData.length === 0 && (
                <div className="p-12 text-center text-slate-500">No records found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
