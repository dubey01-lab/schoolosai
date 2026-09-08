import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { AdmissionEnquiry } from "../../types";
import { UserPlus, Search, Filter, Phone, Mail, Check, Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminAdmissions() {
  const { userData } = useAuth();
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    phone: "",
    email: "",
    classApplyingFor: "",
    status: "NEW" as AdmissionEnquiry["status"],
    notes: ""
  });

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!userData?.schoolId) return;
      try {
        const q = query(collection(db, "admissions"), where("schoolId", "==", userData.schoolId));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionEnquiry));
        setEnquiries(data.sort((a, b) => new Date(b.enquiryDate).getTime() - new Date(a.enquiryDate).getTime()));
      } catch (error) {
        console.error("Error fetching admissions", error);
        toast.error("Failed to load admissions");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId) return;
    setSaving(true);
    try {
      const enquiryDate = new Date().toISOString();
      const newEnquiryData = {
        ...formData,
        schoolId: userData.schoolId,
        enquiryDate,
        createdAt: enquiryDate
      };
      const docRef = await addDoc(collection(db, "admissions"), newEnquiryData);
      setEnquiries([{ id: docRef.id, ...newEnquiryData }, ...enquiries]);
      setShowCreateModal(false);
      setFormData({ studentName: "", parentName: "", phone: "", email: "", classApplyingFor: "", status: "NEW", notes: "" });
      toast.success("Enquiry created successfully");
    } catch (error) {
      console.error("Error creating enquiry", error);
      toast.error("Failed to create enquiry");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionEnquiry["status"]) => {
    try {
      await updateDoc(doc(db, "admissions", id), { status: newStatus, updatedAt: new Date().toISOString() });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Failed to update status");
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.phone.includes(searchTerm);
    const matchesFilter = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admissions CRM</h2>
          <p className="text-slate-500 mt-1">Manage and track prospective student enquiries.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" /> New Enquiry
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by student, parent, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-11 pr-8 py-3 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="ADMISSION">Admission Done</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading admissions...</div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Enquiries Found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your filters or create a new enquiry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.map(enquiry => (
            <div key={enquiry.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  enquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                  enquiry.status === 'CONTACTED' ? 'bg-amber-100 text-amber-700' :
                  enquiry.status === 'INTERESTED' ? 'bg-indigo-100 text-indigo-700' :
                  enquiry.status === 'ADMISSION' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {enquiry.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">{new Date(enquiry.enquiryDate).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{enquiry.studentName}</h3>
              <p className="text-sm font-medium text-indigo-600 mb-4">Applying for Class {enquiry.classApplyingFor}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserPlus className="w-4 h-4 text-slate-400" /> {enquiry.parentName}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" /> {enquiry.phone}
                </div>
                {enquiry.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" /> {enquiry.email}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <select 
                  value={enquiry.status}
                  onChange={(e) => handleStatusChange(enquiry.id!, e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="ADMISSION">Admission Done</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">New Enquiry</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <Check className="w-5 h-5 opacity-0" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student Name *</label>
                <input required type="text" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name *</label>
                  <input required type="text" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class Applying For *</label>
                  <input required type="text" value={formData.classApplyingFor} onChange={e => setFormData({...formData, classApplyingFor: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" placeholder="Optional details..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
