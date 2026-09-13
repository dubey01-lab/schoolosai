const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

// The new AdminExams with Marks Entry modal
const newContent = `
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Exam, Student } from "../../types";
import { Plus, Check, FileText, X, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminExams() {
  const { userData } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExam, setNewExam] = useState({ title: "", class: "", section: "", date: "", subjects: "" });
  const [creating, setCreating] = useState(false);
  
  // Marks Entry States
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<string, Record<string, string>>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      if (!userData?.schoolId) return;
      try {
        const q = query(collection(db, "exams"), where("schoolId", "==", userData.schoolId));
        const snap = await getDocs(q);
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [userData]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId) return;
    setCreating(true);
    try {
      const subjectArray = newExam.subjects.split(",").map(s => s.trim()).filter(s => s);
      const examData = {
        schoolId: userData.schoolId,
        title: newExam.title,
        class: newExam.class,
        section: newExam.section,
        date: newExam.date,
        subjects: subjectArray,
        status: "SCHEDULED",
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "exams"), examData);
      setExams([{ id: docRef.id, ...examData } as Exam, ...exams]);
      setShowCreateModal(false);
      setNewExam({ title: "", class: "", section: "", date: "", subjects: "" });
      toast.success("Exam created successfully");
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  const openMarksEntry = async (exam: Exam) => {
      setSelectedExam(exam);
      setLoadingStudents(true);
      setMarksData({});
      try {
          const q = query(
              collection(db, "students"),
              where("schoolId", "==", userData!.schoolId),
              where("class", "==", exam.class),
              where("section", "==", exam.section)
          );
          const snap = await getDocs(q);
          const stds = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
          stds.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
          setStudents(stds);
      } catch (err) {
          console.error(err);
          toast.error("Failed to load students");
      } finally {
          setLoadingStudents(false);
      }
  };

  const handleSaveMarks = async () => {
    if (!userData?.schoolId || !selectedExam) return;
    setSavingMarks(true);
    try {
      for (const student of students) {
         if (marksData[student.id!]) {
            const marks = marksData[student.id!];
            let total = 0;
            let maxTotal = 0;
            const maxMarks: Record<string, number> = {};
            
            Object.entries(marks).forEach(([subject, mark]) => {
                total += Number(mark);
                maxTotal += 100;
                maxMarks[subject] = 100;
            });
            
            const percentage = (total / maxTotal) * 100;
            let grade = "F";
            if (percentage >= 90) grade = "A+";
            else if (percentage >= 80) grade = "A";
            else if (percentage >= 70) grade = "B";
            else if (percentage >= 60) grade = "C";
            else if (percentage >= 50) grade = "D";

            await addDoc(collection(db, "results"), {
              schoolId: userData.schoolId,
              studentId: student.id,
              examId: selectedExam.id,
              marks: marks,
              maxMarks: maxMarks,
              total,
              percentage: percentage.toFixed(2),
              grade,
              createdAt: new Date().toISOString()
            });
         }
      }
      toast.success("Results saved successfully!");
      setSelectedExam(null);
      setMarksData({});
    } catch (err) {
       console.error(err);
       toast.error("Failed to save results");
    } finally {
       setSavingMarks(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Examinations & Results</h2>
          <p className="text-slate-500 mt-1">Manage school examinations and view academic performance.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> Schedule Exam
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading examinations...</div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Exams Scheduled</h3>
          <p className="text-slate-500 mt-2">Create your first examination to track student performance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${
                  exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  exam.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }\`}>
                  {exam.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
              <p className="text-slate-500 font-medium">Class {exam.class} - {exam.section}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{new Date(exam.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subjects</span>
                  <span className="font-medium text-slate-900">{exam.subjects.length} Subjects</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                 <button onClick={() => openMarksEntry(exam)} className="w-full py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors">
                    Manage Results
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExam && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">Results Entry: {selectedExam.title}</h3>
                 <p className="text-sm text-slate-500">Class {selectedExam.class} - {selectedExam.section}</p>
              </div>
              <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               {loadingStudents ? (
                  <div className="text-center p-8 text-slate-500">Loading students...</div>
               ) : students.length === 0 ? (
                  <div className="text-center p-8 text-slate-500">No students found in this class.</div>
               ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                           <tr className="text-sm font-medium text-slate-500">
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Roll No</th>
                              {selectedExam.subjects.map(sub => (
                                  <th key={sub} className="px-4 py-3">{sub}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {students.map(student => (
                              <tr key={student.id}>
                                 <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                                 <td className="px-4 py-3 text-slate-500">{student.rollNumber}</td>
                                 {selectedExam.subjects.map(sub => (
                                    <td key={sub} className="px-4 py-3">
                                       <input 
                                          type="number" 
                                          min="0" max="100"
                                          placeholder="0-100"
                                          className="w-20 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                          value={marksData[student.id!]?.[sub] || ''}
                                          onChange={(e) => {
                                             setMarksData(prev => ({
                                                ...prev,
                                                [student.id!]: {
                                                   ...(prev[student.id!] || {}),
                                                   [sub]: e.target.value
                                                }
                                             }));
                                          }}
                                       />
                                    </td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={() => setSelectedExam(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button 
                   onClick={handleSaveMarks} 
                   disabled={savingMarks || students.length === 0} 
                   className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                   {savingMarks ? "Saving..." : <><Save className="w-4 h-4"/> Save Marks</>}
                </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Schedule Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
                <input required type="text" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Mid Term Exam" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <input required type="text" value={newExam.class} onChange={e => setNewExam({...newExam, class: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                  <input required type="text" value={newExam.section} onChange={e => setNewExam({...newExam, section: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. A" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (comma separated)</label>
                <input required type="text" value={newExam.subjects} onChange={e => setNewExam({...newExam, subjects: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Math, Science, English" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {creating ? "Scheduling..." : "Schedule Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AdminExams.tsx', newContent);
