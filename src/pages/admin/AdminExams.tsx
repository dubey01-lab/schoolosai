import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Exam } from "../../types";
import { FileText, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminExams() {
  const { userData } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExam, setNewExam] = useState({ title: "", class: "", section: "", date: "", subjects: "" });
  const [creating, setCreating] = useState(false);

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
            <div key={exam.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  exam.status === 'SCHEDULED' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {exam.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
              <p className="text-slate-500 font-medium">Class {exam.class} - {exam.section}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{new Date(exam.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subjects</span>
                  <span className="font-medium text-slate-900">{exam.subjects.length} Subjects</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Schedule Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <Check className="w-5 h-5 opacity-0" />
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
