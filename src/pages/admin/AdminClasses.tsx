import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Layers, Loader2, Trash2 } from "lucide-react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ClassRecord, Section, Subject } from "../../types";
import toast from "react-hot-toast";

export default function AdminClasses() {
  const { userData } = useAuth();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [newClassName, setNewClassName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedClassIdForSection, setSelectedClassIdForSection] = useState("");

  const [savingClass, setSavingClass] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);

  useEffect(() => {
    if (userData?.schoolId) fetchData();
  }, [userData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cSnap = await getDocs(query(collection(db, "classes"), where("schoolId", "==", userData!.schoolId)));
      setClasses(cSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRecord)));

      const secSnap = await getDocs(query(collection(db, "sections"), where("schoolId", "==", userData!.schoolId)));
      setSections(secSnap.docs.map(d => ({ id: d.id, ...d.data() } as Section)));

      const subSnap = await getDocs(query(collection(db, "subjects"), where("schoolId", "==", userData!.schoolId)));
      setSubjects(subSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !userData?.schoolId) return;
    setSavingClass(true);
    try {
      const docRef = await addDoc(collection(db, "classes"), {
        schoolId: userData.schoolId,
        name: newClassName,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        createdBy: userData.uid
      });
      setClasses([...classes, { id: docRef.id, schoolId: userData.schoolId, name: newClassName, status: "ACTIVE", createdAt: new Date().toISOString(), createdBy: userData.uid }]);
      setNewClassName("");
      toast.success("Class added");
    } catch (e) {
      toast.error("Error adding class");
    } finally {
      setSavingClass(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName || !selectedClassIdForSection || !userData?.schoolId) return;
    setSavingSection(true);
    try {
      const docRef = await addDoc(collection(db, "sections"), {
        schoolId: userData.schoolId,
        classId: selectedClassIdForSection,
        name: newSectionName,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        createdBy: userData.uid
      });
      setSections([...sections, { id: docRef.id, schoolId: userData.schoolId, classId: selectedClassIdForSection, name: newSectionName, status: "ACTIVE", createdAt: new Date().toISOString(), createdBy: userData.uid }]);
      setNewSectionName("");
      toast.success("Section added");
    } catch (e) {
      toast.error("Error adding section");
    } finally {
      setSavingSection(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !userData?.schoolId) return;
    setSavingSubject(true);
    try {
      const docRef = await addDoc(collection(db, "subjects"), {
        schoolId: userData.schoolId,
        name: newSubjectName,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        createdBy: userData.uid
      });
      setSubjects([...subjects, { id: docRef.id, schoolId: userData.schoolId, name: newSubjectName, status: "ACTIVE", createdAt: new Date().toISOString(), createdBy: userData.uid }]);
      setNewSubjectName("");
      toast.success("Subject added");
    } catch (e) {
      toast.error("Error adding subject");
    } finally {
      setSavingSubject(false);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await deleteDoc(doc(db, "classes", id));
      setClasses(classes.filter(c => c.id !== id));
      toast.success("Class deleted");
    } catch (e) { toast.error("Error"); }
  };

  const deleteSection = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sections", id));
      setSections(sections.filter(c => c.id !== id));
      toast.success("Section deleted");
    } catch (e) { toast.error("Error"); }
  };

  const deleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "subjects", id));
      setSubjects(subjects.filter(c => c.id !== id));
      toast.success("Subject deleted");
    } catch (e) { toast.error("Error"); }
  };

  if (loading) {
    return <div className="p-12 text-center flex justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Class & Academics Management</h2>
        <p className="text-slate-500 mt-1">Set up classes, sections, and subjects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Classes</h3>
          </div>
          <form onSubmit={handleAddClass} className="flex gap-2 mb-4">
            <input 
              value={newClassName} 
              onChange={e => setNewClassName(e.target.value)} 
              placeholder="e.g. Class 10" 
              required
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
            <button disabled={savingClass} className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {classes.map(c => (
              <li key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">{c.name}</span>
                <button onClick={() => deleteClass(c.id!)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Sections</h3>
          </div>
          <form onSubmit={handleAddSection} className="flex flex-col gap-2 mb-4">
            <select 
              value={selectedClassIdForSection}
              onChange={e => setSelectedClassIdForSection(e.target.value)}
              required
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
            >
              <option value="">Select Class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input 
                value={newSectionName} 
                onChange={e => setNewSectionName(e.target.value)} 
                placeholder="e.g. A" 
                required
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
              <button disabled={savingSection} className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {sections.map(s => {
              const c = classes.find(cl => cl.id === s.classId);
              return (
                <li key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700">{c?.name} - {s.name}</span>
                  <button onClick={() => deleteSection(s.id!)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Subjects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Subjects</h3>
          </div>
          <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
            <input 
              value={newSubjectName} 
              onChange={e => setNewSubjectName(e.target.value)} 
              placeholder="e.g. Mathematics" 
              required
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
            />
            <button disabled={savingSubject} className="bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {subjects.map(s => (
              <li key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">{s.name}</span>
                <button onClick={() => deleteSubject(s.id!)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
