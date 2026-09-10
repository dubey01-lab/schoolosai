import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { School, UserRole } from "../../types";
import { Building2, Settings, Users, Activity, Check, Plus, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { createAccountSecurely } from "../../lib/authUtils";

export default function SuperAdminDashboard() {
  const { userData } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Super Admins shouldn't be here unless they are SUPER_ADMIN
  if (userData?.role !== "SUPER_ADMIN") {
    return <div className="p-12 text-center text-rose-500 font-bold">Unauthorized. Super Admin access only.</div>;
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    principalName: "",
    principalEmail: "",
    principalPhone: "",
    plan: "BASIC" as School["plan"],
    status: "ACTIVE" as School["status"],
    academicYear: "2024-2025"
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const snap = await getDocs(collection(db, "schools"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as School));
      setSchools(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching schools", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.principalEmail || !formData.principalName) {
        throw new Error("Principal details are required.");
      }

      // Create School in Firestore
      const newSchool = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        principalName: formData.principalName,
        principalEmail: formData.principalEmail,
        principalPhone: formData.principalPhone,
        plan: formData.plan,
        status: formData.status,
        academicYear: formData.academicYear,
        createdAt: new Date().toISOString()
      };
      let schoolRef;
      try {
        schoolRef = await addDoc(collection(db, "schools"), newSchool);
        
        // Create Principal Account in Auth & Firestore Users collection
        // For MVP we use a default password "password123", they can reset it later.
        await createAccountSecurely(formData.principalEmail, {
          name: formData.principalName,
          role: "ADMIN",
          schoolId: schoolRef.id
        });
      } catch (authError: any) {
        if (schoolRef) {
          await deleteDoc(doc(db, "schools", schoolRef.id));
        }
        throw authError;
      }
      
      toast.success("School and Principal account created successfully. Activation email sent.");
      
      setSchools([{ id: schoolRef.id, ...newSchool }, ...schools]);
      setShowCreateModal(false);
      setFormData({
        name: "", email: "", phone: "", address: "", city: "", state: "",
        principalName: "", principalEmail: "", principalPhone: "",
        plan: "BASIC", status: "ACTIVE", academicYear: "2024-2025"
      });
    } catch (error: any) {
      console.error("Error creating school", error);
      toast.error(error.message || "Failed to create school");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: School["status"]) => {
    try {
      await updateDoc(doc(db, "schools", id), { status: newStatus, updatedAt: new Date().toISOString() });
      setSchools(schools.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-indigo-900 p-8 rounded-3xl text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">SchoolOS Platform Administration</h1>
          <p className="text-indigo-200 mt-2">Manage tenants, subscriptions, and platform settings.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
        >
          <Plus className="w-5 h-5" /> Onboard New School
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Schools</p>
            <p className="text-3xl font-bold text-slate-900">{schools.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Tenants</p>
            <p className="text-3xl font-bold text-slate-900">{schools.filter(s => s.status === 'ACTIVE').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Suspended / Expired</p>
            <p className="text-3xl font-bold text-slate-900">{schools.filter(s => s.status !== 'ACTIVE').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">School Directory</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading directory...</div>
        ) : schools.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No schools onboarded yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr className="text-sm text-slate-500 font-medium">
                <th className="px-6 py-4">School Details</th>
                <th className="px-6 py-4">Principal Info</th>
                <th className="px-6 py-4">Plan & Term</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{school.name}</p>
                    <p className="text-sm text-slate-500">{school.city}, {school.state}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {school.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{school.principalName}</p>
                    <p className="text-sm text-slate-500">{school.principalEmail}</p>
                    <p className="text-xs text-slate-500">{school.principalPhone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">{school.plan}</span>
                    <p className="text-sm text-slate-500 mt-2">{school.academicYear}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={school.status}
                      onChange={(e) => handleStatusChange(school.id!, e.target.value as any)}
                      className={`text-sm font-bold bg-transparent border-0 focus:ring-0 cursor-pointer ${
                        school.status === 'ACTIVE' ? 'text-emerald-600' : 
                        school.status === 'EXPIRED' ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      <option value="ACTIVE" className="text-slate-900">ACTIVE</option>
                      <option value="EXPIRED" className="text-slate-900">EXPIRED</option>
                      <option value="SUSPENDED" className="text-slate-900">SUSPENDED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/superadmin/schools/${school.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">Onboard New School</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <Check className="w-6 h-6 opacity-0" />
              </button>
            </div>
            <form onSubmit={handleCreateSchool} className="p-6 space-y-6">
              
              <div>
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">School Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">School Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">School Email *</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">School Phone *</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Principal / Administrator Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Principal Name *</label>
                    <input required type="text" value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Principal Email *</label>
                    <input required type="email" value={formData.principalEmail} onChange={e => setFormData({...formData, principalEmail: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Principal Phone *</label>
                    <input required type="tel" value={formData.principalPhone} onChange={e => setFormData({...formData, principalPhone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Subscription Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                    <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                    <input required type="text" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {saving ? "Creating..." : "Create School Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
