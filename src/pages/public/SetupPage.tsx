import React, { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      let uid;
      try {
        // Create the Firebase Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          // If the auth user already exists, sign them in to continue setup
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          uid = userCredential.user.uid;
        } else {
          throw authError;
        }
      }
      
      // Write the SUPER_ADMIN role to Firestore
      try {
        await setDoc(doc(db, "users", uid), {
          uid: uid,
          email: email,
          name: name,
          role: "SUPER_ADMIN",
          createdAt: new Date().toISOString()
        });
      } catch (firestoreError: any) {
        // If the document already exists, the security rules will block the write.
        // This is fine, we can just proceed as they already have a profile.
        if (firestoreError.code === 'permission-denied') {
          const { getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(doc(db, "users", uid));
          if (!docSnap.exists()) {
            throw new Error("Failed to create user document. Permission denied by Firestore rules.");
          }
        } else {
          throw firestoreError;
        }
      }

      toast.success("Super Admin account verified successfully!");
      // Redirect with a full reload to ensure AuthContext fetches the newly created document
      window.location.href = "/superadmin/dashboard";
      
    } catch (error: any) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Setup</h1>
          <p className="text-slate-500 mt-2">Initialize the first Super Admin account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSetup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="admin@schoolos.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initialize Platform"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
