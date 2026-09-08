import React, { useState, useEffect } from "react";
import { Search, Filter, Receipt, Eye, Printer, Download, CreditCard, ArrowRightLeft, IndianRupee } from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { FeeTransaction, Student } from "../../types";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function AdminFeeTransactions() {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState<(FeeTransaction & { studentName?: string, className?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userData?.schoolId) return;
      try {
        const q = query(
          collection(db, "feeTransactions"), 
          where("schoolId", "==", userData.schoolId),
          // orderBy("paymentDate", "desc"), // Requires composite index if we use where
        );
        const snapshot = await getDocs(q);
        
        const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeTransaction));
        
        // In a real app we'd join this better or store denormalized data in the transaction
        const studentIds = [...new Set(txns.map(t => t.studentId))];
        const studentMap = new Map<string, any>();
        
        if (studentIds.length > 0) {
           // Basic fetch, handle large arrays properly in prod
           const studentsQ = query(collection(db, "students"), where("schoolId", "==", userData.schoolId));
           const studentsSnap = await getDocs(studentsQ);
           studentsSnap.forEach(doc => {
             const s = doc.data() as Student;
             studentMap.set(doc.id, { name: s.name, class: s.class });
           });
        }

        const enrichedTxns = txns.map(t => ({
          ...t,
          studentName: studentMap.get(t.studentId)?.name || 'Unknown',
          className: studentMap.get(t.studentId)?.class || 'N/A'
        }));
        
        // Sort descending in memory for demo
        enrichedTxns.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        
        setTransactions(enrichedTxns);
      } catch (error) {
        console.error("Error fetching transactions", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [userData]);

  const filteredTxns = transactions.filter(t => {
    const matchesSearch = t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.studentName && t.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = methodFilter === "ALL" || t.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
          <p className="text-slate-500 mt-1">View and manage all fee payment records.</p>
        </div>
        <Link to="/admin/fees/collect" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          Collect Payment
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search receipt no or student name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
              <Filter className="w-4 h-4" />
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-transparent outline-none">
                <option value="ALL">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Receipt No.</th>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Receipt className="w-8 h-8 text-slate-300" /></div>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{txn.receiptNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{txn.studentName}</p>
                      <p className="text-xs text-slate-500">Class {txn.className}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{format(new Date(txn.paymentDate), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-slate-500">{format(new Date(txn.paymentDate), 'h:mm a')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {txn.paymentMethod === 'CASH' ? <IndianRupee className="w-4 h-4 text-emerald-600" /> : <CreditCard className="w-4 h-4 text-blue-600" />}
                        <span className="text-sm font-medium text-slate-700">{txn.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">₹{txn.totalPayable.toLocaleString('en-IN')}</p>
                      {txn.status === 'REFUNDED' && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1 inline-block">REFUNDED</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="Print Receipt"><Printer className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Refund"><ArrowRightLeft className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
