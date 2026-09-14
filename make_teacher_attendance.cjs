const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { Student } from "../../types";
import { CalendarCheck, Search, Check, X, Clock, UserMinus, Save } from "lucide-react";
import toast from "react-hot-toast";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

export default function TeacherAttendance() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: AttendanceStatus, remarks?: string }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!userData?.schoolId || !userData?.uid) return;
      try {
        let tData = null;
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        if (teacherDoc.exists()) {
          tData = { id: teacherDoc.id, ...teacherDoc.data() };
        } else {
          const tQ = query(collection(db, "teachers"), where("email", "==", userData.email), where("schoolId", "==", userData.schoolId));
          const tSnap = await getDocs(tQ);
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() };
        }
        setTeacher(tData);
        if (tData?.classes && tData.classes.length > 0) {
          setSelectedClass(tData.classes[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeacher();
  }, [userData]);

  const loadAttendance = async () => {
    if (!userData?.schoolId || !selectedClass || !date) return;
    setLoading(true);
    setDataLoaded(false);
    try {
      const [className, section] = selectedClass.split("-");
      const sq = query(
        collection(db, "students"),
        where("schoolId", "==", userData.schoolId),
        where("class", "==", className),
        where("section", "==", section)
      );
      const sSnap = await getDocs(sq);
      const sData = sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)).sort((a,b) => (a.rollNumber || "").localeCompare(b.rollNumber || ""));
      setStudents(sData);

      const attId = \`\${userData.schoolId}_\${selectedClass}_\${date}\`;
      const attRef = doc(db, "attendance", attId);
      const attSnap = await getDoc(attRef);
      
      const attObj: Record<string, { status: AttendanceStatus, remarks?: string }> = {};
      
      if (attSnap.exists()) {
        const data = attSnap.data();
        if (data.records) {
          data.records.forEach((r: any) => {
            attObj[r.studentId] = { status: r.status, remarks: r.remarks };
          });
        }
      } else {
        sData.forEach(s => {
          if (s.id) attObj[s.id] = { status: "PRESENT" };
        });
      }
      setAttendanceState(attObj);
      setDataLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && date) {
      loadAttendance();
    }
  }, [selectedClass, date]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newState = { ...attendanceState };
    students.forEach(s => {
      if (s.id) {
        newState[s.id] = { ...newState[s.id], status };
      }
    });
    setAttendanceState(newState);
  };

  const saveAttendance = async () => {
    if (!userData?.schoolId || !teacher?.id || students.length === 0) return;
    setSaving(true);
    try {
      const [className, section] = selectedClass.split("-");
      const records = Object.entries(attendanceState).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks || ""
      }));

      const attId = \`\${userData.schoolId}_\${selectedClass}_\${date}\`;
      await setDoc(doc(db, "attendance", attId), {
        schoolId: userData.schoolId,
        class: className,
        section: section,
        date: date,
        teacherId: teacher.id,
        records: records,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    present: Object.values(attendanceState).filter(s => s.status === "PRESENT").length,
    absent: Object.values(attendanceState).filter(s => s.status === "ABSENT").length,
    late: Object.values(attendanceState).filter(s => s.status === "LATE").length,
    leave: Object.values(attendanceState).filter(s => s.status === "HALF_DAY").length,
  };

  if (!teacher) return <div className="p-12 text-center text-slate-500">Loading teacher data...</div>;
  if (!teacher.classes || teacher.classes.length === 0) {
    return <div className="p-12 text-center text-slate-500">You are not assigned to any classes.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Mark Attendance</h2>
        <p className="text-slate-500 mt-1">Record daily attendance for your classes.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {teacher.classes.map((c: string) => (
                <option key={c} value={c}>{c.replace('-', ' Section ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading students...</div>
        ) : !dataLoaded ? (
          <div className="py-12 text-center text-slate-500">Select a class and date to load attendance.</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
            No students found in this class.
          </div>
        ) : (
          <div className="space-y-6 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{stats.present}</span>
                <span className="text-sm font-medium opacity-80">Present</span>
              </div>
              <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{stats.absent}</span>
                <span className="text-sm font-medium opacity-80">Absent</span>
              </div>
              <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{stats.late}</span>
                <span className="text-sm font-medium opacity-80">Late</span>
              </div>
              <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{stats.leave}</span>
                <span className="text-sm font-medium opacity-80">On Leave</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => markAll("PRESENT")} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">Mark All Present</button>
                <button onClick={() => markAll("ABSENT")} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">Mark All Absent</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-4 font-semibold text-sm">Roll No</th>
                    <th className="py-3 px-4 font-semibold text-sm">Student</th>
                    <th className="py-3 px-4 font-semibold text-sm text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-sm">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-600">{student.rollNumber || "-"}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{student.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleStatusChange(student.id!, "PRESENT")}
                            className={\`p-2 rounded-lg flex items-center justify-center transition-colors \${attendanceState[student.id!]?.status === "PRESENT" ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"}\`}
                            title="Present"
                          ><Check className="w-4 h-4" /></button>
                          <button
                            onClick={() => handleStatusChange(student.id!, "ABSENT")}
                            className={\`p-2 rounded-lg flex items-center justify-center transition-colors \${attendanceState[student.id!]?.status === "ABSENT" ? "bg-rose-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600"}\`}
                            title="Absent"
                          ><X className="w-4 h-4" /></button>
                          <button
                            onClick={() => handleStatusChange(student.id!, "LATE")}
                            className={\`p-2 rounded-lg flex items-center justify-center transition-colors \${attendanceState[student.id!]?.status === "LATE" ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600"}\`}
                            title="Late"
                          ><Clock className="w-4 h-4" /></button>
                          <button
                            onClick={() => handleStatusChange(student.id!, "HALF_DAY")}
                            className={\`p-2 rounded-lg flex items-center justify-center transition-colors \${attendanceState[student.id!]?.status === "HALF_DAY" ? "bg-blue-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"}\`}
                            title="Leave"
                          ><UserMinus className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Add remark..."
                          value={attendanceState[student.id!]?.remarks || ""}
                          onChange={(e) => handleRemarksChange(student.id!, e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherAttendance.tsx', content);
