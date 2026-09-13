import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { Student, Teacher, AttendanceRecord } from "../../types";
import { CalendarCheck, Users, Check, X, AlertCircle, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherAttendance() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY">>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!userData?.uid) return;
      try {
        let tData: Teacher | null = null;
        const docRef = doc(db, "teachers", userData.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          tData = { id: docSnap.id, ...docSnap.data() } as Teacher;
        } else {
          const tQ = query(collection(db, "teachers"), where("email", "==", userData.email));
          const tSnap = await getDocs(tQ);
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() } as Teacher;
        }
        
        if (tData) {
          setTeacher(tData);
          if (tData.classes && tData.classes.length > 0) {
            setSelectedClass(tData.classes[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [userData]);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!userData?.schoolId || !selectedClass || !date) return;
      setLoading(true);
      try {
        const [className, section] = selectedClass.split('-');
        
        // Fetch students
        const qStudents = query(
          collection(db, "students"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", className),
          where("section", "==", section)
        );
        const snapStudents = await getDocs(qStudents);
        const fetchedStudents = snapStudents.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        // Sort students by roll number
        fetchedStudents.sort((a, b) => {
          const rA = parseInt(a.rollNumber) || 0;
          const rB = parseInt(b.rollNumber) || 0;
          return rA - rB;
        });
        setStudents(fetchedStudents);

        // Fetch existing attendance
        const qAtt = query(
          collection(db, "attendance"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", className),
          where("section", "==", section),
          where("date", "==", date)
        );
        const snapAtt = await getDocs(qAtt);
        
        const initialAtt: Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"> = {};
        if (!snapAtt.empty) {
          const record = snapAtt.docs[0];
          setExistingRecordId(record.id);
          const data = record.data() as AttendanceRecord;
          data.records.forEach(r => {
            initialAtt[r.studentId] = r.status;
          });
        } else {
          setExistingRecordId(null);
          // Default all to present
          fetchedStudents.forEach(s => {
            if (s.id) initialAtt[s.id] = "PRESENT";
          });
        }
        setAttendanceData(initialAtt);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [userData, selectedClass, date]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY") => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status: "PRESENT" | "ABSENT") => {
    const newAtt = { ...attendanceData };
    students.forEach(s => {
      if (s.id) newAtt[s.id] = status;
    });
    setAttendanceData(newAtt);
  };

  const handleSave = async () => {
    if (!userData?.schoolId || !teacher?.id || !selectedClass || students.length === 0) return;
    setSaving(true);
    
    try {
      const [className, section] = selectedClass.split('-');
      const attendanceId = existingRecordId || `${userData.schoolId}_${className}_${section}_${date}`;
      
      const record = {
        schoolId: userData.schoolId,
        class: className,
        section: section,
        date: date,
        teacherId: teacher.id,
        records: students.map(s => ({
          studentId: s.id as string,
          status: attendanceData[s.id as string] || "PRESENT"
        })),
        updatedAt: serverTimestamp(),
      };

      if (!existingRecordId) {
        Object.assign(record, { createdAt: serverTimestamp() });
      }

      await setDoc(doc(db, "attendance", attendanceId), record, { merge: true });
      toast.success("Attendance saved successfully");
      setExistingRecordId(attendanceId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !teacher) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" /> Mark Attendance
          </h2>
          <p className="text-slate-500 mt-1">Select class and date to manage attendance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-w-[120px]"
            >
              {teacher?.classes?.length ? (
                teacher.classes.map(c => (
                  <option key={c} value={c}>{c.replace('-', ' ')}</option>
                ))
              ) : (
                <option value="">No Classes Assigned</option>
              )}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Date:</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading student roster...</div>
        ) : !selectedClass ? (
          <div className="p-12 text-center text-slate-500">Please select a class to view roster.</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No students found in {selectedClass.replace('-', ' ')}. <br/> Please ask Admin to add students to this class.
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Users className="w-5 h-5" /> {students.length} Students Total
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => markAll("PRESENT")}
                  className="px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Mark All Present
                </button>
                <button 
                  onClick={() => markAll("ABSENT")}
                  className="px-3 py-1.5 text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600 w-16 text-center">Roll No</th>
                    <th className="p-4 font-semibold text-slate-600">Student Name</th>
                    <th className="p-4 font-semibold text-slate-600 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center font-medium text-slate-500">{student.rollNumber}</td>
                      <td className="p-4 font-medium text-slate-900">{student.name} {""}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          {["PRESENT", "ABSENT", "LATE", "HALF_DAY"].map(status => {
                            const isSelected = attendanceData[student.id as string] === status;
                            let colors = "";
                            let label = "";
                            
                            switch (status) {
                              case "PRESENT": 
                                colors = isSelected ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"; 
                                label = "P";
                                break;
                              case "ABSENT": 
                                colors = isSelected ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50"; 
                                label = "A";
                                break;
                              case "LATE": 
                                colors = isSelected ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50"; 
                                label = "L";
                                break;
                              case "HALF_DAY": 
                                colors = isSelected ? "bg-blue-500 text-white border-blue-500" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"; 
                                label = "HD";
                                break;
                            }
                            
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id as string, status as any)}
                                className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm transition-all ${colors}`}
                                title={status}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Attendance
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
