const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { CheckCircle2, Circle, Clock, Plus, Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";

interface Topic {
  id?: string;
  title: string;
  classStr: string;
  subject: string;
  status: "Pending" | "In Progress" | "Completed";
  notes: string;
}

export default function TeacherProgress() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Topic>({
    title: "", classStr: "", subject: "", status: "Pending", notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    if (!userData?.uid || !userData?.schoolId) return;
    setLoading(true);
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

      if (tData?.id) {
        if (tData.classes && tData.classes.length > 0) {
          setSelectedClass(tData.classes[0]);
        }
        const pQ = query(collection(db, "classProgress"), where("schoolId", "==", userData.schoolId), where("teacherId", "==", tData.id));
        const pSnap = await getDocs(pQ);
        const data = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Topic));
        setTopics(data);
      }
    } catch (err) {
      toast.error("Failed to load class progress");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !teacher?.id) return;
    setSaving(true);
    try {
      const docId = editingId || doc(collection(db, "classProgress")).id;
      const payload = {
        schoolId: userData.schoolId,
        teacherId: teacher.id,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "classProgress", docId), payload, { merge: true });
      toast.success(editingId ? "Topic updated" : "Topic added");
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to save topic");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: Topic) => {
    setFormData({ title: t.title, classStr: t.classStr, subject: t.subject, status: t.status, notes: t.notes || "" });
    setEditingId(t.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this topic?")) return;
    try {
      await deleteDoc(doc(db, "classProgress", id));
      setTopics(prev => prev.filter(t => t.id !== id));
      toast.success("Topic deleted");
    } catch (err) {
      toast.error("Failed to delete topic");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading progress...</div>;

  const currentTopics = topics.filter(t => t.classStr === selectedClass);
  const completed = currentTopics.filter(t => t.status === "Completed").length;
  const progressPct = currentTopics.length > 0 ? Math.round((completed / currentTopics.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Class Progress</h2>
          <p className="text-slate-500 mt-1">Track syllabus completion and topics.</p>
        </div>
        <button onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setFormData({ title: "", classStr: selectedClass, subject: teacher?.subject || "", status: "Pending", notes: "" });
            setEditingId(null);
          }
        }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Topic"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select required value={formData.classStr} onChange={e => setFormData({...formData, classStr: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                {saving ? "Saving..." : "Save Topic"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700">
            {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">{completed} / {currentTopics.length} Completed</span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: \`\${progressPct}%\` }}></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {currentTopics.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              No topics found for this class.
            </div>
          ) : (
            <div className="space-y-4">
              {currentTopics.map(topic => (
                <div key={topic.id} className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {topic.status === "Completed" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                       topic.status === "In Progress" ? <Clock className="w-6 h-6 text-amber-500" /> :
                       <Circle className="w-6 h-6 text-slate-300" />}
                    </div>
                    <div>
                      <h4 className={\`font-bold text-lg \${topic.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900'}\`}>{topic.title}</h4>
                      <p className="text-sm font-medium text-slate-500 mb-2">{topic.subject}</p>
                      {topic.notes && <p className="text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-2">{topic.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(topic)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(topic.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherProgress.tsx', content);
