import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, X, Clock, UserMinus, Download, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { Student, AttendanceRecord } from "../../types";
import toast from "react-hot-toast";
import { downloadCSV } from "../../lib/exportUtils";

export default function AdminAttendance() {
  const { userData } = useAuth();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState("10A");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY">>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (students.length === 0) {
      toast.error("No data to export");
      return;
    }
    const data = students.map(s => ({
      ID: s.rollNumber || s.id,
      Name: s.name,
      Class: s.class,
      Section: s.section,
      Status: attendanceState[s.id!] || "Not Marked"
    }));
    downloadCSV(data, `attendance_${selectedClass}_${date}.csv`);
    toast.success("Export successful");
  };

  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // In a real app, we would fetch classes from Firestore. For now, matching the string format used when adding students.
  const classOptions = ["10A", "10B", "9A"]; 

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, date, userData?.schoolId]);

  const fetchAttendance = async () => {
    if (!userData?.schoolId) return;
    setLoading(true);
    setIsDataLoaded(false);
    try {
      // 1. Fetch Students for this class
      const classParts = selectedClass.match(/([0-9]+)([a-zA-Z]+)/);
      const cName = classParts ? classParts[1] : selectedClass;
      const cSec = classParts ? classParts[2] : "";
      
      let studentsQ;
      if (cSec) {
        studentsQ = query(
          collection(db, "students"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", cName),
          where("section", "==", cSec)
        );
      } else {
        studentsQ = query(
          collection(db, "students"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", selectedClass)
        );
      }
      
      const sSnap = await getDocs(studentsQ);
      const sData = sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Student));
      setStudents(sData);

      // 2. Fetch existing attendance
      const attId = `${userData.schoolId}_${selectedClass}_${date}`;
      const attRef = doc(db, "attendance", attId);
      const attSnap = await getDoc(attRef);
      
      const attObj: Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"> = {};
      
      if (attSnap.exists()) {
        const data = attSnap.data() as AttendanceRecord;
        data.records.forEach(r => {
          attObj[r.studentId] = r.status;
        });
      } else {
        // Initialize all as PRESENT if no record exists
        sData.forEach(s => {
          if (s.id) attObj[s.id] = "PRESENT";
        });
      }
      
      setAttendanceState(attObj);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY") => {
    setAttendanceState(prev => ({ ...prev, [id]: status }));
  };

  const markAllPresent = () => {
    const newState: Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"> = {};
    students.forEach(s => {
      if (s.id) newState[s.id] = "PRESENT";
    });
    setAttendanceState(newState);
  };

  const saveAttendance = async () => {
    if (!userData?.schoolId) return;
    setSaving(true);
    try {
      const classParts = selectedClass.match(/([0-9]+)([a-zA-Z]+)/);
      const cName = classParts ? classParts[1] : selectedClass;
      const cSec = classParts ? classParts[2] : "";
      
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const attId = `${userData.schoolId}_${selectedClass}_${date}`;
      await setDoc(doc(db, "attendance", attId), {
        schoolId: userData.schoolId,
        class: cName,
        section: cSec,
        date: date,
        teacherId: userData.uid, // Admin who recorded it
        records,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    present: Object.values(attendanceState).filter(s => s === "PRESENT").length,
    absent: Object.values(attendanceState).filter(s => s === "ABSENT").length,
    late: Object.values(attendanceState).filter(s => s === "LATE").length,
    leave: Object.values(attendanceState).filter(s => s === "HALF_DAY").length,
  };
  
  const totalStudents = students.length;
  const attendancePercentage = totalStudents > 0 ? Math.round((stats.present / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance</h2>
          <p className="text-slate-500 mt-1">Manage daily student attendance.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
             <CalendarIcon className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm font-medium text-slate-500">Attendance Rate</p>
             <p className="text-2xl font-bold text-slate-900">{attendancePercentage}%</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
             <Check className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm font-medium text-slate-500">Present</p>
             <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
             <X className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm font-medium text-slate-500">Absent</p>
             <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
             <Clock className="w-6 h-6" />
           </div>
           <div>
             <p className="text-sm font-medium text-slate-500">Late / Leave</p>
             <p className="text-2xl font-bold text-slate-900">{stats.late + stats.leave}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className="text-xs font-medium text-slate-500">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700"
              />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-40">
              <label className="text-xs font-medium text-slate-500">Class & Section</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700"
              >
                {classOptions.map(opt => (
                  <option key={opt} value={opt}>Class {opt}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search student..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
               />
             </div>
             <button 
               onClick={markAllPresent}
               className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap"
             >
               Mark All Present
             </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserMinus className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No students found for this class.</p>
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Roll No.</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700">Student Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  if (!student.id) return null;
                  const status = attendanceState[student.id];
                  return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium">{student.rollNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStatus(student.id!, "PRESENT")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all border",
                            status === "PRESENT" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <Check className="w-4 h-4" /> Present
                        </button>
                        <button
                          onClick={() => updateStatus(student.id!, "ABSENT")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all border",
                            status === "ABSENT" 
                              ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm" 
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <X className="w-4 h-4" /> Absent
                        </button>
                        <button
                          onClick={() => updateStatus(student.id!, "LATE")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all border",
                            status === "LATE" 
                              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" 
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <Clock className="w-4 h-4" /> Late
                        </button>
                        <button
                          onClick={() => updateStatus(student.id!, "HALF_DAY")}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all border",
                            status === "HALF_DAY" 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" 
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <UserMinus className="w-4 h-4" /> Half Day
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
        
        {students.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button 
              onClick={saveAttendance}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
