import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Loader2, Edit, Trash2, Users } from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Student } from "../../types";
import toast from "react-hot-toast";
import { createAccountSecurely } from "../../lib/authUtils";
import { useNavigate } from "react-router-dom";

export default function AdminStudents() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [userData?.schoolId]);

  const fetchStudents = async () => {
    if (!userData?.schoolId) return;
    try {
      const q = query(collection(db, "students"), where("schoolId", "==", userData.schoolId));
      const querySnapshot = await getDocs(q);
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData?.schoolId) return;
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const parentEmail = formData.get("parentEmail") as string;
    const parentName = formData.get("parentName") as string;

    try {
      let parentId = "";
      
      try {
        parentId = await createAccountSecurely(parentEmail, {
          name: parentName,
          role: "PARENT",
          schoolId: userData.schoolId
        });
        toast.success("Created Parent account and sent setup email.");
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.message?.includes('email-already-in-use')) {
          const pq = query(collection(db, "users"), where("email", "==", parentEmail), where("schoolId", "==", userData.schoolId));
          const pSnap = await getDocs(pq);
          if (!pSnap.empty) {
            parentId = pSnap.docs[0].id;
            toast.success("Linked to existing Parent account.");
          } else {
            throw new Error("Email in use by a different school or user record not found.");
          }
        } else {
          throw authErr;
        }
      }
      
      if (!parentId) throw new Error("Failed to resolve parent account.");

      const newStudent: Partial<Student> = {
        schoolId: userData.schoolId,
        name: formData.get("name") as string,
        rollNumber: formData.get("rollNumber") as string,
        class: formData.get("class") as string,
        section: formData.get("section") as string,
        parentId: parentId,
        parentName: parentName,
        parentPhone: formData.get("parentPhone") as string,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "students"), newStudent);
      setStudents([{ id: docRef.id, ...newStudent } as Student, ...students]);
      setIsAddModalOpen(false);
      toast.success("Student added successfully");
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        setStudents(students.filter(s => s.id !== id));
        toast.success("Student deleted");
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-500 mt-1">Manage all students in your school.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, roll number, or class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors bg-white">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No students found</h3>
              <p className="text-slate-500 mt-1">Get started by adding your first student.</p>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Add Student
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Parent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => navigate(`/admin/students/\${student.id}`)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.rollNumber}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {student.class} - {student.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{student.parentName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{student.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium " + (
                        student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      )}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(student.id!); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        >
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 lg:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input name="name" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number *</label>
                  <input name="rollNumber" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Class *</label>
                  <input name="class" required placeholder="e.g. X" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Section *</label>
                  <input name="section" required placeholder="e.g. A" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Name *</label>
                  <input name="parentName" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Email *</label>
                  <input type="email" name="parentEmail" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Phone *</label>
                  <input name="parentPhone" required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors active:scale-95 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
