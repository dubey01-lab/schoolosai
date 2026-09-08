import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, User, Phone, Mail, MapPin, Loader2, Calendar } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";
import { db } from "../../lib/firebase";
import { School } from "../../types";

export default function SuperAdminSchoolManage() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchool = async () => {
      if (!schoolId) return;
      try {
        const docRef = doc(db, "schools", schoolId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSchool({ id: snap.id, ...snap.data() } as School);
        } else {
          setError("School not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load school data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [schoolId]);

  const handleResetPassword = async () => {
    if (!school) return;
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, school.principalEmail);
      toast.success("Password reset email sent to principal.");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to send reset email.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/superadmin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl font-medium border border-rose-100 flex items-center justify-center">
          {error || "School not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/superadmin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-900 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Building2 className="w-8 h-8 text-indigo-100" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{school.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-indigo-200 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {school.city}, {school.state}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {school.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {school.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Principal Information
            </h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Name</p>
                <p className="font-semibold text-slate-900">{school.principalName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
                <p className="font-semibold text-slate-900">{school.principalEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Phone</p>
                <p className="font-semibold text-slate-900">{school.principalPhone}</p>
              </div>
              <div className="pt-4 border-t border-slate-200 mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Account Status</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                    Active
                  </span>
                  <button 
                    onClick={handleResetPassword}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Send Password Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Subscription & Status
            </h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Current Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  school.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  school.status === 'EXPIRED' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {school.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Subscription Plan</p>
                <p className="font-semibold text-slate-900">{school.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Academic Year</p>
                <p className="font-semibold text-slate-900">{school.academicYear}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
