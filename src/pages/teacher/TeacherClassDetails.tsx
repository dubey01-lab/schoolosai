import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Teacher, Student, Homework, AttendanceRecord } from "../../types";
import { Users, CalendarCheck, BookOpen, FileText, ArrowLeft, Plus, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherClassDetails() {
  const { classId } = useParams(); // Format: "10-A"
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState("STUDENTS");
  
  // States for sub-modules
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY">>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [newHomework, setNewHomework] = useState({ title: "", description: "", dueDate: "" });
  const [savingHomework, setSavingHomework] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!userData?.uid || !userData?.schoolId || !classId) return;
      
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        if (!teacherDoc.exists()) throw new Error("Teacher not found");
        
        const tData = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        setTeacher(tData);
        
        if (!tData.classes?.includes(classId)) {
          toast.error("You are not assigned to this class");
          navigate("/teacher/classes");
          return;
        }

        const [className, section] = classId.split("-");
        
        // Fetch Students
        const studentsQ = query(
          collection(db, "students"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", className.trim()),
          where("section", "==", section.trim())
        );
        const studentsSnap = await getDocs(studentsQ);
        const sData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        sData.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        setStudents(sData);

        // Fetch Homework
        const hwQ = query(
          collection(db, "homework"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", className.trim()),
          where("section", "==", section.trim())
        );
        const hwSnap = await getDocs(hwQ);
        setHomeworkList(hwSnap.docs.map(d => ({ id: d.id, ...d.data() } as Homework)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        
        // Set default attendance state
        const initialAtt: Record<string, "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY"> = {};
        sData.forEach(s => { if (s.id) initialAtt[s.id] = "PRESENT"; });
        setAttendanceState(initialAtt);

      } catch (error) {
        console.error("Error fetching class data", error);
        toast.error("Failed to load workspace");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [userData, classId, navigate]);

  const handleSaveAttendance = async () => {
    if (!userData?.schoolId || !userData?.uid || !classId) return;
    setSavingAttendance(true);
    try {
      const [className, section] = classId.split("-");
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        studentId,
        status
      }));

      await addDoc(collection(db, "attendance"), {
        schoolId: userData.schoolId,
        class: className.trim(),
        section: section.trim(),
        date: attendanceDate,
        teacherId: userData.uid,
        records,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !userData?.uid || !classId || !teacher) return;
    if (!newHomework.title || !newHomework.description || !newHomework.dueDate) {
      toast.error("Please fill all fields");
      return;
    }
    setSavingHomework(true);
    try {
      const [className, section] = classId.split("-");
      const hwRef = await addDoc(collection(db, "homework"), {
        schoolId: userData.schoolId,
        teacherId: userData.uid,
        class: className.trim(),
        section: section.trim(),
        subject: teacher.subject || "General",
        title: newHomework.title,
        description: newHomework.description,
        dueDate: newHomework.dueDate,
        status: "ACTIVE",
        createdAt: new Date().toISOString()
      });
      
      toast.success("Homework published");
      setNewHomework({ title: "", description: "", dueDate: "" });
      
      // Refresh homework list
      const hwQ = query(collection(db, "homework"), where("schoolId", "==", userData.schoolId), where("class", "==", className.trim()), where("section", "==", section.trim()));
      const hwSnap = await getDocs(hwQ);
      setHomeworkList(hwSnap.docs.map(d => ({ id: d.id, ...d.data() } as Homework)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    } catch (error) {
      console.error("Error saving homework:", error);
      toast.error("Failed to assign homework");
    } finally {
      setSavingHomework(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading workspace...</div>;
  if (!teacher || !classId) return null;

  const [className, section] = classId.split("-");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/teacher/classes")} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Class {className} - {section}</h2>
          <p className="text-slate-500">Subject: {teacher.subject || "General"}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {["STUDENTS", "ATTENDANCE", "HOMEWORK", "RESULTS"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-4 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'STUDENTS' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Enrolled Students ({students.length})</h3>
              {students.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-500">No students found in this class.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-sm text-slate-500 font-medium">
                        <th className="px-6 py-3">Roll No</th>
                        <th className="px-6 py-3">Student Name</th>
                        <th className="px-6 py-3">Parent Name</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(s => (
                        <tr key={s.id} className="text-sm hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-700">{s.rollNumber}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                          <td className="px-6 py-4 text-slate-600">{s.parentName || "-"}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">ACTIVE</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800">Mark Attendance</h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Date:</label>
                  <input 
                    type="date" 
                    value={attendanceDate} 
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance || students.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {savingAttendance ? "Saving..." : "Save Register"}
                  </button>
                </div>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-500">No students available for attendance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <div key={student.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-500">Roll: {student.rollNumber}</p>
                      </div>
                      <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button 
                          onClick={() => student.id && setAttendanceState(prev => ({ ...prev, [student.id!]: "PRESENT" }))}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${attendanceState[student.id!] === "PRESENT" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
                        >
                          P
                        </button>
                        <button 
                          onClick={() => student.id && setAttendanceState(prev => ({ ...prev, [student.id!]: "ABSENT" }))}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${attendanceState[student.id!] === "ABSENT" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'HOMEWORK' && (
            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h4 className="font-bold text-slate-800 mb-4">Assign New Homework</h4>
                <form onSubmit={handleSaveHomework} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <input 
                        type="text" 
                        value={newHomework.title}
                        onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="e.g. Chapter 4 Exercises"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                      <input 
                        type="date" 
                        value={newHomework.dueDate}
                        onChange={(e) => setNewHomework({...newHomework, dueDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      value={newHomework.description}
                      onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" 
                      placeholder="Detailed instructions..."
                      required 
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={savingHomework}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {savingHomework ? "Publishing..." : "Publish Homework"}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-4">Previous Assignments</h4>
                {homeworkList.length === 0 ? (
                  <div className="text-center p-8 border border-slate-200 rounded-2xl">
                    <p className="text-slate-500">No homework assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homeworkList.map(hw => (
                      <div key={hw.id} className="p-5 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-slate-900">{hw.title}</h5>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{hw.description}</p>
                        <div className="mt-3 text-xs font-medium text-indigo-600">
                          Subject: {hw.subject}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'RESULTS' && (
            <div className="text-center p-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Results Management</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Select an exam created by the administrator to enter marks for this class. 
                Results management is available for administrators in this version. Please contact your admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
