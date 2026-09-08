import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Student, AttendanceRecord } from "../../types";
import { CalendarCheck, AlertCircle } from "lucide-react";

export default function ParentAttendance() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<{ total: number, present: number, records: { date: string, status: string }[] }>({ total: 0, present: 0, records: [] });

  useEffect(() => {
    const fetchChildren = async () => {
      if (!userData?.uid) return;
      try {
        const q = query(collection(db, "students"), where("parentId", "==", userData.uid));
        const snap = await getDocs(q);
        const childData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        setChildren(childData);
        if (childData.length > 0 && childData[0].id) {
          setSelectedChildId(childData[0].id);
        }
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    };
    fetchChildren();
  }, [userData]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedChildId || !userData?.schoolId) return;
      setLoading(true);
      try {
        const child = children.find(c => c.id === selectedChildId);
        if (!child) return;
        
        const q = query(
          collection(db, "attendance"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", child.class),
          where("section", "==", child.section)
        );
        const snap = await getDocs(q);
        const allRecords = snap.docs.map(d => d.data() as AttendanceRecord);
        
        let present = 0;
        let total = 0;
        const myRecords: { date: string, status: string }[] = [];
        
        allRecords.forEach(att => {
          const studentRecord = att.records.find(r => r.studentId === selectedChildId);
          if (studentRecord) {
            total++;
            if (studentRecord.status === "PRESENT") present++;
            myRecords.push({ date: att.date, status: studentRecord.status });
          }
        });
        
        myRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAttendanceData({ total, present, records: myRecords });

      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedChildId, userData, children]);

  if (loading && children.length === 0) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const percentage = attendanceData.total > 0 ? Math.round((attendanceData.present / attendanceData.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Tracker</h2>
          <p className="text-slate-500 mt-1">View your child's attendance history and statistics.</p>
        </div>
        
        {children.length > 1 && (
          <select 
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        )}
      </div>

      {children.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500">No student profiles linked to your account.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-indigo-50 text-indigo-600">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
              <h3 className="font-bold text-slate-800">Attendance Rate</h3>
              <p className="text-sm text-slate-500 mt-1">Current Academic Year</p>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-emerald-50 text-emerald-600">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{attendanceData.present}</p>
              <h3 className="font-medium text-slate-500 mt-1">Days Present</h3>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-rose-50 text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{attendanceData.total - attendanceData.present}</p>
              <h3 className="font-medium text-slate-500 mt-1">Days Absent</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Recent History</h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading attendance data...</div>
            ) : attendanceData.records.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No attendance records found.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                  <tr className="text-sm text-slate-500 font-medium">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceData.records.slice(0, 10).map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                          record.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
