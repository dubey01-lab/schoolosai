import React, { useState, useEffect } from "react";
import { CreditCard, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { StudentFee, FeeTransaction, Student } from "../../types";

export default function ParentFees() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [fees, setFees] = useState<(StudentFee & { studentName?: string })[]>([]);
  const [transactions, setTransactions] = useState<(FeeTransaction & { feeName?: string })[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;
      try {
        // Fetch children
        const studentsQ = query(collection(db, "students"), where("parentId", "==", userData.uid));
        const studentsSnap = await getDocs(studentsQ);
        const childrenData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setMyChildren(childrenData);
        
        if (childrenData.length > 0) {
          const childIds = childrenData.map(c => c.id);
          
          // In a real app we'd query by chunks if array is large, or use "in" query up to 10 elements.
          const feesQ = query(
            collection(db, "fees"),
            where("studentId", "in", childIds.slice(0, 10))
          );
          const feesSnap = await getDocs(feesQ);
          const feesData = feesSnap.docs.map(d => {
            const f = { id: d.id, ...d.data() } as StudentFee;
            const student = childrenData.find(c => c.id === f.studentId);
            return { ...f, studentName: student?.name };
          });
          setFees(feesData);

          const txnsQ = query(
            collection(db, "feeTransactions"),
            where("studentId", "in", childIds.slice(0, 10))
          );
          const txnsSnap = await getDocs(txnsQ);
          setTransactions(txnsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeeTransaction)).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
        }
      } catch (error) {
        console.error("Error fetching fees", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData]);

  const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
  const totalOverdue = fees.filter(f => new Date(f.dueDate) < new Date() && f.pendingAmount > 0).reduce((sum, f) => sum + f.pendingAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fee Details</h2>
          <p className="text-slate-500 mt-1">Manage and track fee payments for your children.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total Pending</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Overdue Amount</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalOverdue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm flex flex-col items-center justify-center text-center border-l-4 border-l-indigo-600">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">Make Payment</p>
          <button className="text-indigo-600 font-bold mt-1 hover:underline">Pay Online Now →</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Fee Structures & Dues</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading fees...</div>
          ) : fees.length === 0 ? (
            <div className="text-center py-12">
               <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
               <h4 className="text-lg font-bold text-slate-800">All Clear!</h4>
               <p className="text-slate-500">No pending fees found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fees.map(fee => {
                const isOverdue = new Date(fee.dueDate) < new Date() && fee.pendingAmount > 0;
                return (
                  <div key={fee.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{fee.academicYear} Term Fee</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full \${isOverdue ? 'bg-rose-100 text-rose-700' : fee.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isOverdue ? 'OVERDUE' : fee.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">For {fee.studentName} • Due on {new Date(fee.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Pending</p>
                          <p className={`text-xl font-bold \${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>₹{fee.pendingAmount.toLocaleString()}</p>
                        </div>
                        {fee.pendingAmount > 0 && (
                          <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-100 transition-colors shrink-0">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent transactions found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(txn => (
                  <tr key={txn.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{txn.receiptNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(txn.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{txn.totalPayable.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">{txn.paymentMethod}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
