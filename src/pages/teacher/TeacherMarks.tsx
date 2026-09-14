import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc , serverTimestamp } from "firebase/firestore";
import { FileText, Save, Check, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Student } from "../../types";

export default function TeacherMarks() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClassObj, setSelectedClassObj] = useState("");
  const [formSubject, setFormSubject] = useState("");
  
  const [marksState, setMarksState] = useState<Record<string, { marks: number | "", maxMarks: number, remarks: string, grade: string }>>({});
  const [maxMarks, setMaxMarks] = useState(100);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const initData = async () => {
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
        if (tData?.subject) setFormSubject(tData.subject);
        if (tData?.classes?.length) setSelectedClassObj(tData.classes[0]);

        // Fetch Exams
        const exQ = query(collection(db, "exams"), where("schoolId", "==", userData.schoolId));
        const exSnap = await getDocs(exQ);
        const exData = exSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(e => e.status !== "DRAFT");
        setExams(exData);
        if (exData.length > 0) setSelectedExam(exData[0].id);

      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, [userData]);

  const loadStudentsAndMarks = async () => {
    if (!userData?.schoolId || !selectedClassObj || !selectedExam || !formSubject) return;
    setLoading(true);
    setDataLoaded(false);
    try {
      const [className, section] = selectedClassObj.split("-");
      const sq = query(
        collection(db, "students"),
        where("schoolId", "==", userData.schoolId),
        where("class", "==", className),
        where("section", "==", section)
      );
      const sSnap = await getDocs(sq);
      const sData = sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)).sort((a,b) => (a.rollNumber || "").localeCompare(b.rollNumber || ""));
      setStudents(sData);

      // Load existing marks
      const mQ = query(
        collection(db, "results"),
        where("schoolId", "==", userData.schoolId),
        where("examId", "==", selectedExam),
        where("class", "==", className),
        where("section", "==", section),
        where("subject", "==", formSubject)
      );
      const mSnap = await getDocs(mQ);
      
      const mObj: Record<string, { marks: number | "", maxMarks: number, remarks: string, grade: string }> = {};
      
      // Default initialization
      sData.forEach(s => {
        if (s.id) mObj[s.id] = { marks: "", maxMarks: maxMarks, remarks: "", grade: "" };
      });

      mSnap.docs.forEach(d => {
        const data = d.data();
        if (data.studentId && mObj[data.studentId]) {
          mObj[data.studentId] = { marks: data.marks, maxMarks: data.maxMarks || maxMarks, remarks: data.remarks || "", grade: data.grade || "" };
        }
      });

      setMarksState(mObj);
      setDataLoaded(true);
    } catch (err) {
      toast.error("Failed to load students and marks");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    let numVal: number | "" = value === "" ? "" : Number(value);
    if (numVal !== "" && (numVal < 0 || numVal > maxMarks)) {
      return; // Invalid mark
    }
    setMarksState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: numVal }
    }));
  };

  const handleRemarkChange = (studentId: string, value: string) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: value }
    }));
  };

  const getGrade = (marks: number | "", max: number) => {
    if (marks === "") return "";
    const pct = (marks / max) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  const saveMarks = async () => {
    if (!userData?.schoolId || students.length === 0 || !selectedExam) return;
    
    if (!window.confirm("Are you sure you want to submit these marks? You can edit them later if needed.")) return;
    
    setSaving(true);
    try {
      const [className, section] = selectedClassObj.split("-");
      const examName = exams.find(e => e.id === selectedExam)?.title || "Exam";

      const batchPromises = students.map(async (student) => {
        if (!student.id) return;
        const sData = marksState[student.id];
        if (sData.marks === "") return; // Skip empty

        const resultId = `${userData.schoolId}_${selectedExam}_${student.id}_${formSubject}`.replace(/\s+/g, "_");
        const payload = {
          schoolId: userData.schoolId,
          examId: selectedExam,
          examName: examName,
          studentId: student.id,
          studentName: student.name,
          class: className,
          section: section,
          subject: formSubject,
          teacherId: teacher.id,
          marks: sData.marks,
          maxMarks: maxMarks,
          percentage: ((sData.marks as number) / maxMarks) * 100,
          grade: getGrade(sData.marks, maxMarks),
          remarks: sData.remarks,
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, "results", resultId), payload, { merge: true });
      });

      await Promise.all(batchPromises);
      toast.success("Marks saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())));

  if (!teacher) return <div className="p-12 text-center text-slate-500">Loading teacher data...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Enter Marks</h2>
        <p className="text-slate-500 mt-1">Record student performance for exams.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Exam</label>
            <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class & Section</label>
            <select value={selectedClassObj} onChange={(e) => setSelectedClassObj(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option value="">Select Class</option>
              {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <input type="text" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Marks</label>
            <input type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value) || 100)} min={1} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={loadStudentsAndMarks} className="px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
            Load Students
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 border-t border-slate-100 mt-6 pt-6">Loading students...</div>
        ) : !dataLoaded ? (
          <div className="py-12 text-center text-slate-500 border-t border-slate-100 mt-6 pt-6">Select exam and class to load students.</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 mt-6 pt-6">No students found.</div>
        ) : (
          <div className="space-y-6 border-t border-slate-100 pt-6 mt-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-4 font-semibold text-sm">Roll No</th>
                    <th className="py-3 px-4 font-semibold text-sm">Student</th>
                    <th className="py-3 px-4 font-semibold text-sm w-32">Marks</th>
                    <th className="py-3 px-4 font-semibold text-sm w-24">Grade</th>
                    <th className="py-3 px-4 font-semibold text-sm">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => {
                    const st = marksState[student.id!];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-600">{student.rollNumber || "-"}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{student.name}</td>
                        <td className="py-3 px-4">
                          <input 
                            type="number" 
                            min="0" 
                            max={maxMarks}
                            value={st?.marks ?? ""} 
                            onChange={(e) => handleMarkChange(student.id!, e.target.value)} 
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-700">{getGrade(st?.marks ?? "", maxMarks)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            placeholder="Optional remark..."
                            value={st?.remarks || ""} 
                            onChange={(e) => handleRemarkChange(student.id!, e.target.value)} 
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button onClick={saveMarks} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                {saving ? "Saving..." : "Submit Marks"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
