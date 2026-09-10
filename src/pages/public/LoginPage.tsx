import React, { useState } from "react";
import { SEO } from "../../components/SEO";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, userData } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (userData) {
      if (userData.role === "SUPER_ADMIN") {
        toast.error("Super Admin accounts must use the Super Admin Portal.");
        navigate("/superadmin/login");
      } else if (userData.role === "ADMIN") navigate("/admin/dashboard");
      else if (userData.role === "TEACHER") navigate("/teacher/dashboard");
      else if (userData.role === "PARENT") navigate("/parent/dashboard");
    }
  }, [userData, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Successfully logged in");
      // Navigation is handled by the useEffect above when userData updates
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  
  

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <SEO 
        title="SchoolOS AI Login | Principal, Teacher & Parent" 
        description="Securely log in to your SchoolOS AI school management portal as a Principal, Admin, Teacher, or Parent." 
        canonicalUrl="/login" 
        noindex={true}
      />
      
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SchoolOS AI Login</h1>
          <p className="text-slate-500 mt-2">Principal / Teacher / Parent</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-sm text-slate-600">Remember me for 30 days</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
