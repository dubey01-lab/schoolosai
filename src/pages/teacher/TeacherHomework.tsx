import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { Teacher, Homework } from "../../types";
import { BookOpen, Plus, Clock, Save, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherHomework() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create mode state
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    classObj: "", // Format: "class-section"
    title: "",
    description: "",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    if (!userData?.uid || !userData?.schoolId) return;
    setLoading(true);
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
        if (tData.classes && tData.classes.length > 0 && !formData.classObj) {
          setFormData(prev => ({ ...prev, classObj: tData.classes![0] }));
        }
      }

      // Fetch Homeworks created by this teacher
      const hwQ = query(
        collection(db, "homework"),
        where("schoolId", "==", userData.schoolId),
        where("teacherId", "==", tData?.id || userData.uid)
      );
      const hwSnap = await getDocs(hwQ);
      const fetchedHomeworks = hwSnap.docs.map(d => ({ id: d.id, ...d.data() } as Homework));
      
      fetchedHomeworks.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setHomeworks(fetchedHomeworks);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load homework data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !teacher?.id || !formData.classObj || !formData.title || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSaving(true);
    try {
      const [className, section] = formData.classObj.split('-');
      
      const newHw: Homework = {
        schoolId: userData.schoolId,
        teacherId: teacher.id,
        class: className,
        section: section,
        subject: teacher.subject || "General",
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "homework"), {
        ...newHw,
        createdAt: serverTimestamp()
      });

      toast.success("Homework assigned successfully");
      setIsCreating(false);
      setFormData({
        ...formData,
        title: "",
        description: "",
      });
      fetchData(); // Refresh list

    } catch (err) {
      console.error(err);
      toast.error("Failed to assign homework");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !teacher) return <div className="p-8 text-center text-slate-500">Loading workspace...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Homework & Assignments
          </h2>
          <p className="text-slate-500 mt-1">Manage and assign tasks for your classes</p>
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" /> Assign Homework
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Create New Assignment</h3>
            <button 
              onClick={() => setIsCreating(false)}
              className="text-slate-500 hover:text-slate-700 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleCreate} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Class *</label>
                <select
                  required
                  value={formData.classObj}
                  onChange={(e) => setFormData({...formData, classObj: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select a class</option>
                  {teacher?.classes?.map(c => (
                    <option key={c} value={c}>{c.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assignment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Chapter 5: Algebra Practice"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description / Instructions</label>
              <textarea
                rows={4}
                placeholder="Provide details about the assignment..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                {saving ? "Assigning..." : "Assign Homework"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {homeworks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Homework Assigned</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                You haven't assigned any homework yet. Click the button above to create your first assignment.
              </p>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
              >
                Assign Now
              </button>
            </div>
          ) : (
            homeworks.map(hw => (
              <div key={hw.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                        Class {hw.class}-{hw.section}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200">
                        {hw.subject}
                      </span>
                      {new Date(hw.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-100">
                          Past Due
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{hw.title}</h3>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{hw.description}</p>
                    </div>
                  </div>
                  
                  <div className="md:w-64 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between shrink-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="font-medium text-slate-900">Due Date</p>
                          <p>{new Date(hw.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-medium text-slate-900">Assigned On</p>
                          <p>{new Date(hw.createdAt || new Date()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
