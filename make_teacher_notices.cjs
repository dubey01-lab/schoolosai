const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Bell, Search, Plus, Trash2, Edit2, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface Notice {
  id?: string;
  schoolId: string;
  creatorId: string;
  creatorRole: string;
  title: string;
  content: string;
  audience: string;
  targetClass?: string;
  publishDate: string;
  expiryDate?: string;
  status: "PUBLISHED" | "DRAFT" | "UNPUBLISHED";
  createdAt: string;
}

export default function TeacherNotices() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [schoolNotices, setSchoolNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MY_NOTICES" | "SCHOOL_NOTICES">("MY_NOTICES");
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Notice>>({
    title: "", content: "", audience: "CLASS", targetClass: "", publishDate: new Date().toISOString().split('T')[0], expiryDate: "", status: "PUBLISHED"
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        // Teacher's own notices
        const nQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId), where("creatorId", "==", tData.id));
        const nSnap = await getDocs(nQ);
        const myData = nSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotices(myData);
      }

      // School Notices (Admin created)
      const sQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId), where("creatorRole", "in", ["ADMIN", "SUPER_ADMIN"]), where("status", "==", "PUBLISHED"));
      const sSnap = await getDocs(sQ);
      const sData = sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)).filter(n => n.audience === "ALL_TEACHERS" || n.audience === "ALL").sort((a,b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      setSchoolNotices(sData);

    } catch (err) {
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !teacher?.id || !formData.title || !formData.content) return;
    if (formData.audience === "CLASS" && !formData.targetClass) {
      toast.error("Please select a target class"); return;
    }
    setSaving(true);
    try {
      const docId = editingId || doc(collection(db, "notices")).id;
      const payload: any = {
        schoolId: userData.schoolId,
        creatorId: teacher.id,
        creatorRole: "TEACHER",
        title: formData.title,
        content: formData.content,
        audience: formData.audience,
        targetClass: formData.audience === "CLASS" ? formData.targetClass : "",
        publishDate: formData.publishDate,
        status: formData.status || "PUBLISHED",
        updatedAt: new Date().toISOString()
      };
      if (formData.expiryDate) payload.expiryDate = formData.expiryDate;
      if (!editingId) payload.createdAt = new Date().toISOString();

      await setDoc(doc(db, "notices", docId), payload, { merge: true });
      toast.success(editingId ? "Notice updated" : "Notice created");
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (n: Notice) => {
    setFormData({
      title: n.title, content: n.content, audience: n.audience, targetClass: n.targetClass || "", publishDate: n.publishDate, expiryDate: n.expiryDate || "", status: n.status
    });
    setEditingId(n.id!);
    setShowForm(true);
    setActiveTab("MY_NOTICES");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
      setNotices(prev => prev.filter(n => n.id !== id));
      toast.success("Notice deleted");
    } catch (err) {
      toast.error("Failed to delete notice");
    }
  };

  const toggleStatus = async (n: Notice) => {
    try {
      const newStatus = n.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
      await setDoc(doc(db, "notices", n.id!), { status: newStatus }, { merge: true });
      setNotices(prev => prev.map(x => x.id === n.id ? { ...x, status: newStatus } : x));
      toast.success(\`Notice \${newStatus.toLowerCase()}\`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading notices...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notices</h2>
          <p className="text-slate-500 mt-1">Manage class announcements and view school notices.</p>
        </div>
        <button onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setFormData({ title: "", content: "", audience: "CLASS", targetClass: "", publishDate: new Date().toISOString().split('T')[0], expiryDate: "", status: "PUBLISHED" });
            setEditingId(null);
          }
        }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Create Notice"}
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("MY_NOTICES")} className={\`px-6 py-3 font-medium text-sm transition-colors \${activeTab === "MY_NOTICES" ? "border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}\`}>My Notices</button>
        <button onClick={() => setActiveTab("SCHOOL_NOTICES")} className={\`px-6 py-3 font-medium text-sm transition-colors \${activeTab === "SCHOOL_NOTICES" ? "border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}\`}>School Notices</button>
      </div>

      {showForm && activeTab === "MY_NOTICES" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                <select value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value, targetClass: ""})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="CLASS">Specific Class</option>
                  <option value="ALL_STUDENTS">All My Students</option>
                </select>
              </div>
              {formData.audience === "CLASS" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Class *</label>
                  <select required value={formData.targetClass} onChange={e => setFormData({...formData, targetClass: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="">Select Class</option>
                    {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date *</label>
                <input required type="date" value={formData.publishDate} onChange={e => setFormData({...formData, publishDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option value="PUBLISHED">Published</option>
                  <option value="UNPUBLISHED">Unpublished</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                {saving ? "Saving..." : (editingId ? "Update Notice" : "Publish Notice")}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "MY_NOTICES" ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {notices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50">No notices created yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.map(n => (
                <div key={n.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
                    <h3 className="font-bold text-slate-900 text-lg">{n.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={\`px-2 py-1 rounded-lg text-xs font-bold \${n.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}\`}>{n.status}</span>
                      <button onClick={() => toggleStatus(n)} className="p-1.5 text-slate-400 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm" title="Toggle Status"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(n)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(n.id!)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap mb-3">{n.content}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Audience: {n.audience === "CLASS" ? \`Class \${n.targetClass}\` : "All Students"}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Published: {new Date(n.publishDate).toLocaleDateString()}</span>
                    {n.expiryDate && <span className="bg-slate-100 px-2 py-1 rounded-md">Expires: {new Date(n.expiryDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {schoolNotices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50">No school notices available.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {schoolNotices.map(n => (
                <div key={n.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><Bell className="w-6 h-6" /></div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900">{n.title}</h3>
                      <span className="text-xs font-medium text-slate-400">{new Date(n.publishDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{n.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherNotices.tsx', content);
