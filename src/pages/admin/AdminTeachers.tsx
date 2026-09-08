import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Teacher } from "../../types";
import toast from "react-hot-toast";
import { createAccountSecurely } from "../../lib/authUtils";

export default function AdminTeachers() {
  const { userData } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [userData?.schoolId]);

  const fetchTeachers = async () => {
    if (!userData?.schoolId) return;
    try {
      const q = query(collection(db, "teachers"), where("schoolId", "==", userData.schoolId));
      const querySnapshot = await getDocs(q);
      const data: Teacher[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Teacher);
      });
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData?.schoolId) return;
    
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    try {
      // Create user auth and db record
      const newUid = await createAccountSecurely(email, {
        name,
        role: "TEACHER",
        schoolId: userData.schoolId
      });

      const newTeacher: Partial<Teacher> = {
        id: newUid,
        schoolId: userData.schoolId,
        name,
        email,
        phone: formData.get("phone") as string,
        subject: formData.get("subject") as string,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      // Create teacher profile
      await addDoc(collection(db, "teachers"), newTeacher);
      
      setTeachers([{ ...newTeacher } as Teacher, ...teachers]);
      setIsAddModalOpen(false);
      toast.success("Teacher account created. Activation email sent.");
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast.error(error.message || "Failed to add teacher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteDoc(doc(db, "teachers", id));
        setTeachers(teachers.filter(t => t.id !== id));
        toast.success("Teacher profile deleted");
      } catch (error) {
        toast.error("Failed to delete teacher");
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teachers</h2>
          <p className="text-slate-500 mt-1">Manage staff and teacher accounts.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No teachers found</h3>
              <p className="text-slate-500 mt-1">Get started by adding your first teacher.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{teacher.subject}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{teacher.email}</div>
                      <div className="text-xs text-slate-400">{teacher.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"}>
                        {teacher.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(teacher.id!)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 lg:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input name="name" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                  <input name="phone" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                  <input name="subject" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
