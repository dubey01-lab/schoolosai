import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc , serverTimestamp } from "firebase/firestore";
import { User, Mail, Phone, BookOpen, Save, Shield, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherProfile() {
  const { userData, user } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid || !userData?.schoolId) return;
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
        if (tData) {
          setPhone(tData.phone || "");
          setQualification(tData.qualification || "");
        }

        const schoolDoc = await getDoc(doc(db, "schools", userData.schoolId));
        if (schoolDoc.exists()) setSchool(schoolDoc.data());

      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher?.id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "teachers", teacher.id), {
        phone,
        qualification,
        updatedAt: serverTimestamp()
      });
      // Also update users collection if phone changes
      if (userData?.uid) {
        await updateDoc(doc(db, "users", userData.uid), {
          phone
        });
      }
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <p className="text-slate-500 mt-1">Manage your personal information.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 h-32 relative"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg">
              <div className="w-full h-full bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-3xl font-bold">
                {teacher?.name?.charAt(0) || "T"}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900">{teacher?.name}</h3>
              <p className="text-indigo-600 font-medium">{teacher?.subject || "General Teacher"}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Verified Teacher
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Personal Information</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email (Read Only)</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                  <Mail className="w-5 h-5" /> {teacher?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Qualification</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={qualification} onChange={e => setQualification(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. M.Sc. Mathematics" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="space-y-6">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Academic Assignments</h4>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">School</p>
                <p className="font-bold text-slate-900">{school?.name || "Your School"}</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-3">Assigned Classes</p>
                {teacher?.classes?.length === 0 ? (
                  <p className="text-sm text-slate-600">No classes assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teacher?.classes?.map((c: string) => (
                      <span key={c} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-sm text-orange-800">
                <span className="font-bold">Note:</span> Role, email, and class assignments are managed by the school administrator. You cannot change them yourself.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
