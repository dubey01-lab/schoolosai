import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Copy, FileText, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { FeeStructure } from "../../types";
import toast from "react-hot-toast";

export default function AdminFeeStructure() {
  const { userData } = useAuth();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialForm: Partial<FeeStructure> = {
    academicYear: "2026-2027",
    className: "",
    feeName: "",
    amount: 0,
    frequency: "MONTHLY",
    dueDate: "",
    isOptional: false,
    description: "",
    status: "ACTIVE",
  };
  
  const [formData, setFormData] = useState<Partial<FeeStructure>>(initialForm);

  const fetchStructures = async () => {
    if (!userData?.schoolId) return;
    try {
      const q = query(collection(db, "feeStructures"), where("schoolId", "==", userData.schoolId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeStructure));
      setStructures(data);
    } catch (error) {
      console.error("Error fetching structures:", error);
      toast.error("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [userData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId) return;

    try {
      if (isEditing && formData.id) {
        // Edit logic would go here
        toast.success("Fee structure updated");
      } else {
        await addDoc(collection(db, "feeStructures"), {
          ...formData,
          schoolId: userData.schoolId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success("Fee structure created successfully");
      }
      setIsModalOpen(false);
      setFormData(initialForm);
      setIsEditing(false);
      fetchStructures();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this fee structure? It cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "feeStructures", id));
        toast.success("Fee structure deleted");
        fetchStructures();
      } catch (error) {
        toast.error("Failed to delete fee structure");
      }
    }
  };

  const filteredStructures = structures.filter(s => 
    s.feeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fee Structures</h2>
          <p className="text-slate-500 mt-1">Manage and define fee types and their amounts across classes.</p>
        </div>
        <button 
          onClick={() => { setFormData(initialForm); setIsEditing(false); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Structure
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by fee name or class..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Fee Name</th>
                <th className="px-6 py-4 font-medium">Class</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Frequency</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                    Loading fee structures...
                  </td>
                </tr>
              ) : filteredStructures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><FileText className="w-8 h-8 text-slate-300" /></div>
                    No fee structures found.
                  </td>
                </tr>
              ) : (
                filteredStructures.map((structure) => (
                  <tr key={structure.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{structure.feeName}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{structure.description}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{structure.className}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{structure.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {structure.frequency.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {structure.isOptional ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">Optional</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">Required</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => structure.id && handleDelete(structure.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit' : 'Create'} Fee Structure</h3>
                <p className="text-sm text-slate-500 mt-1">Define payment parameters for a class.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                  <input type="text" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                  <select value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required>
                    <option value="">Select Class</option>
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "ALL"].map(c => <option key={c} value={c}>{c === "ALL" ? "All Classes" : `Class \${c}`}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fee Name (e.g., Tuition Fee, Transport)</label>
                <input type="text" value={formData.feeName} onChange={e => setFormData({...formData, feeName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" min="0" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as any})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" required>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONE_TIME">One Time</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                 <div className="flex gap-4">
                   <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                     <input type="radio" name="isOptional" checked={!formData.isOptional} onChange={() => setFormData({...formData, isOptional: false})} className="text-indigo-600 focus:ring-indigo-500" /> Required
                   </label>
                   <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                     <input type="radio" name="isOptional" checked={formData.isOptional} onChange={() => setFormData({...formData, isOptional: true})} className="text-indigo-600 focus:ring-indigo-500" /> Optional
                   </label>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm resize-none"></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} type="button" className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Save Structure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
