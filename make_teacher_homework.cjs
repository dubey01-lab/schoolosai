const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Search, Plus, Calendar, Clock, Edit2, Trash2, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { Homework } from "../../types";

export default function TeacherHomework() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  
  // Form State
  const [formData, setFormData] = useState<Partial<Homework>>({
    title: "",
    description: "",
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    priority: "Normal",
    status: "PUBLISHED"
  });
  const [selectedClassObj, setSelectedClassObj] = useState("");
  const [formSubject, setFormSubject] = useState("");
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
        const hQ = query(
          collection(db, "homework"), 
          where("schoolId", "==", userData.schoolId), 
          where("teacherId", "==", tData.id)
        );
        const hSnap = await getDocs(hQ);
        const hData = hSnap.docs.map(d => ({ id: d.id, ...d.data() } as Homework));
        // Sort by date DESC
        hData.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setHomeworks(hData);
        if (tData.subject) setFormSubject(tData.subject);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load homework");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hw: Homework) => {
    setSelectedClassObj(\`\${hw.class}-\${hw.section}\`);
    setFormSubject(hw.subject);
    setFormData({
      title: hw.title,
      description: hw.description,
      assignedDate: hw.assignedDate || hw.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: hw.dueDate,
      priority: hw.priority || "Normal",
      status: hw.status
    });
    setEditingId(hw.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;
    try {
      await deleteDoc(doc(db, "homework", id));
      setHomeworks(prev => prev.filter(h => h.id !== id));
      toast.success("Homework deleted");
    } catch (err) {
      toast.error("Failed to delete homework");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !teacher?.id || !selectedClassObj || !formSubject || !formData.title || !formData.description || !formData.assignedDate || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.dueDate) < new Date(formData.assignedDate)) {
      toast.error("Due date cannot be before assigned date");
      return;
    }

    setSaving(true);
    try {
      const [className, section] = selectedClassObj.split("-");
      const hwId = editingId || doc(collection(db, "homework")).id;
      
      const payload = {
        schoolId: userData.schoolId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        class: className,
        section: section,
        subject: formSubject,
        title: formData.title,
        description: formData.description,
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        priority: formData.priority || "Normal",
        status: formData.status || "PUBLISHED",
        updatedAt: new Date().toISOString()
      };

      if (!editingId) {
        (payload as any).createdAt = new Date().toISOString();
      }

      await setDoc(doc(db, "homework", hwId), payload, { merge: true });
      
      toast.success(editingId ? "Homework updated successfully" : "Homework assigned successfully");
      setShowForm(false);
      setEditingId(null);
      // Reset form
      setFormData({
        title: "",
        description: "",
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        priority: "Normal",
        status: "PUBLISHED"
      });
      setSelectedClassObj("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save homework");
    } finally {
      setSaving(false);
    }
  };

  const filteredHomeworks = homeworks.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) || h.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? \`\${h.class}-\${h.section}\` === filterClass : true;
    return matchesSearch && matchesClass;
  });

  if (loading) return <div className="p-12 text-center text-slate-500">Loading homeworks...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Homework Management</h2>
          <p className="text-slate-500 mt-1">Assign and track homework for your classes.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({
                title: "", description: "", assignedDate: new Date().toISOString().split('T')[0], dueDate: "", priority: "Normal", status: "PUBLISHED"
              });
              setSelectedClassObj("");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Assign Homework"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-slate-800 mb-6">{editingId ? "Edit Homework" : "Assign New Homework"}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class & Section *</label>
                <select required value={selectedClassObj} onChange={(e) => setSelectedClassObj(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">Select Class</option>
                  {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c.replace('-', ' Section ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                <input required type="text" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Homework Title *</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter title" />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Instructions *</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Detailed instructions..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Date *</label>
                <input required type="date" value={formData.assignedDate} onChange={(e) => setFormData({...formData, assignedDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
                <input required type="date" value={formData.dueDate} min={formData.assignedDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="PUBLISHED">Published</option>
                  <option value="CLOSED">Closed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" disabled={saving} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <BookOpen className="w-5 h-5" />}
                {saving ? "Saving..." : (editingId ? "Update Homework" : "Publish Homework")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search homework..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Classes</option>
            {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {filteredHomeworks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">No homework found.</div>
          ) : (
            filteredHomeworks.map(hw => (
              <div key={hw.id} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{hw.class}-{hw.section}</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{hw.subject}</span>
                      <span className={\`px-2.5 py-1 rounded-lg text-xs font-bold \${hw.priority === 'Urgent' ? 'bg-rose-50 text-rose-700' : hw.priority === 'Important' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}\`}>{hw.priority || 'Normal'}</span>
                      <span className={\`px-2.5 py-1 rounded-lg text-xs font-bold \${hw.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}\`}>{hw.status}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{hw.title}</h4>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(hw)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(hw.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{hw.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Assigned: {new Date(hw.assignedDate || hw.createdAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5 text-orange-600"><Clock className="w-4 h-4" /> Due: {new Date(hw.dueDate).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherHomework.tsx', content);
