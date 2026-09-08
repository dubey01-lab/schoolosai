import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Student, StudentFee } from "../../types";
import { User, Mail, Phone, MapPin, Receipt, Clock, CheckCircle2 } from "lucide-react";

export default function AdminStudentDetails() {
  const { id } = useParams();
  const { userData } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("FEES");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!userData?.schoolId || !id) return;
      try {
        const studentDoc = await getDoc(doc(db, "students", id));
        if (studentDoc.exists()) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() } as Student);
        }

        const feesQ = query(
          collection(db, "fees"),
          where("schoolId", "==", userData.schoolId),
          where("studentId", "==", id)
        );
        const feesSnap = await getDocs(feesQ);
        setFees(feesSnap.docs.map(d => ({ id: d.id, ...d.data() } as StudentFee)));

      } catch (error) {
        console.error("Error fetching student details", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [userData, id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  if (!student) return <div className="p-8 text-center text-slate-500">Student not found.</div>;

  const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const totalOverdue = fees.filter(f => new Date(f.dueDate) < new Date() && f.pendingAmount > 0).reduce((sum, f) => sum + f.pendingAmount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
            <p className="text-lg text-slate-500 mt-1">Class {student.class} - {student.section} • Roll No: {student.rollNumber}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {student.parentName && <div className="flex items-center gap-1.5 text-sm text-slate-600"><User className="w-4 h-4" /> {student.parentName}</div>}
              {student.parentPhone && <div className="flex items-center gap-1.5 text-sm text-slate-600"><Phone className="w-4 h-4" /> {student.parentPhone}</div>}
            </div>
          </div>
          <div className="shrink-0 flex gap-2">
            <Link to="/admin/fees/collect" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Collect Fee</Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab("PROFILE")} className={`px-6 py-4 font-medium text-sm transition-colors relative \${activeTab === 'PROFILE' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Profile
            {activeTab === 'PROFILE' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
          </button>
          <button onClick={() => setActiveTab("FEES")} className={`px-6 py-4 font-medium text-sm transition-colors relative \${activeTab === 'FEES' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Financials
            {activeTab === 'FEES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === 'PROFILE' && (
             <div className="text-slate-500">Student profile details go here...</div>
          )}
          
          {activeTab === 'FEES' && (
             <div className="space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Fees</p>
                    <p className="text-2xl font-bold text-slate-900">₹{totalFees.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-sm font-medium text-amber-700 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                    <p className="text-sm font-medium text-rose-700 mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-rose-700">₹{totalOverdue.toLocaleString()}</p>
                  </div>
               </div>

               <div>
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Fee Breakdown</h3>
                 {fees.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500">No fee records found for this student.</p>
                    </div>
                 ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr className="text-sm text-slate-500 font-medium">
                            <th className="px-6 py-3">Academic Year</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Paid</th>
                            <th className="px-6 py-3">Pending</th>
                            <th className="px-6 py-3">Due Date</th>
                            <th className="px-6 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fees.map(fee => (
                            <tr key={fee.id} className="text-sm hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">{fee.academicYear}</td>
                              <td className="px-6 py-4">₹{fee.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-emerald-600">₹{fee.paidAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 font-bold text-slate-900">₹{fee.pendingAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold \${
                                  fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                  fee.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                                  fee.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {fee.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 )}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
