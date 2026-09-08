import React, { useState, useEffect } from "react";
import { Search, Filter, AlertCircle, Bell, Clock, MoreVertical, Send, CheckCircle2 } from "lucide-react";
import { collection, query, where, getDocs, orderBy, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { StudentFee, Student } from "../../types";
import { format, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

export default function AdminFeePending() {
  const { userData } = useAuth();
  const [pendingFees, setPendingFees] = useState<(StudentFee & { studentName?: string, className?: string, parentId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingFees = async () => {
      if (!userData?.schoolId) return;
      try {
        const q = query(
          collection(db, "fees"), 
          where("schoolId", "==", userData.schoolId),
          where("status", "in", ["PENDING", "PARTIAL", "OVERDUE"])
        );
        const snapshot = await getDocs(q);
        
        const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentFee));
        
        const studentIds = [...new Set(fees.map(f => f.studentId))];
        const studentMap = new Map<string, any>();
        
        if (studentIds.length > 0) {
           const studentsQ = query(collection(db, "students"), where("schoolId", "==", userData.schoolId));
           const studentsSnap = await getDocs(studentsQ);
           studentsSnap.forEach(doc => {
             const s = doc.data() as Student;
             studentMap.set(doc.id, { name: s.name, class: s.class, parentId: s.parentId });
           });
        }

        const enrichedFees = fees.map(f => {
          const student = studentMap.get(f.studentId);
          return {
            ...f,
            studentName: student?.name || 'Unknown',
            className: student?.class || 'N/A',
            parentId: student?.parentId
          };
        });
        
        // Update overdue status dynamically if past due date
        const today = new Date();
        enrichedFees.forEach(fee => {
          if (new Date(fee.dueDate) < today && fee.status !== "OVERDUE") {
            fee.status = "OVERDUE";
            // In a real app we'd update DB too, but we will just show it here
          }
        });

        // Sort by due date ascending
        enrichedFees.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        setPendingFees(enrichedFees);
      } catch (error) {
        console.error("Error fetching pending fees", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingFees();
  }, [userData]);

  const handleSendReminder = async (fee: any) => {
    if (!userData?.schoolId || !fee.parentId || !fee.id) {
      toast.error("Missing parent contact information");
      return;
    }
    
    if (confirm(`Send fee reminder to parent of \${fee.studentName} for ₹\${fee.pendingAmount}?`)) {
      setSendingReminderId(fee.id);
      try {
        // Integrate with existing notification service structure
        await addDoc(collection(db, "notifications"), {
          schoolId: userData.schoolId,
          userId: fee.parentId, // Parent ID
          title: fee.status === 'OVERDUE' ? 'Fee Overdue Alert' : 'Fee Reminder',
          message: `Reminder: ₹\${fee.pendingAmount.toLocaleString()} is \${fee.status === 'OVERDUE' ? 'overdue' : 'due'} for \${fee.studentName}.`,
          type: "FEE_REMINDER",
          referenceId: fee.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        toast.success("Reminder sent successfully");
      } catch (error) {
        toast.error("Failed to send reminder");
      } finally {
        setSendingReminderId(null);
      }
    }
  };

  const filteredFees = pendingFees.filter(f => {
    const matchesSearch = f.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.className?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pending Fees</h2>
          <p className="text-slate-500 mt-1">Track outstanding dues and send automated reminders.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student or class..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
              <Filter className="w-4 h-4" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent outline-none">
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Fee Details</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Pending Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                    Loading pending fees...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
                    No pending fees found. Everyone is paid up!
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const today = new Date();
                  const dueDate = new Date(fee.dueDate);
                  const daysDiff = differenceInDays(today, dueDate);
                  const isOverdue = daysDiff > 0;

                  return (
                    <tr key={fee.id} className={`hover:bg-slate-50/50 transition-colors group \${isOverdue ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{fee.studentName}</p>
                        <p className="text-xs text-slate-500">Class {fee.className}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">Term Fee</p>
                        <p className="text-xs text-slate-500">Total: ₹{fee.totalAmount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium \${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>{format(dueDate, 'MMM d, yyyy')}</p>
                        {isOverdue && <p className="text-xs text-rose-500 font-medium">{daysDiff} days overdue</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-lg">₹{fee.pendingAmount.toLocaleString('en-IN')}</p>
                        {fee.paidAmount > 0 && <p className="text-xs text-emerald-600 font-medium">₹{fee.paidAmount.toLocaleString()} paid</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full \${
                          fee.status === 'OVERDUE' || isOverdue ? 'bg-rose-100 text-rose-700' : 
                          fee.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isOverdue ? 'OVERDUE' : fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleSendReminder(fee)}
                            disabled={sendingReminderId === fee.id || !fee.parentId}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {sendingReminderId === fee.id ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <Bell className="w-3.5 h-3.5" />}
                            Remind
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
