import React, { useState } from "react";
import { SEO } from "../../components/SEO";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function BookDemoPage() {
  const [formData, setFormData] = useState({
    name: "",
    schoolName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    role: "",
    studentCount: "",
    contactMethod: "email",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await addDoc(collection(db, "enquiries"), {
        ...formData,
        source: "BOOK_DEMO",
        status: "NEW",
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <SEO 
        title="Book a School Management Software Demo | SchoolOS AI" 
        description="Book a demo with SchoolOS AI to see how our modern school management platform can streamline your administrative workflows, fee management, and parent communication." 
        canonicalUrl="/book-demo" 
        noindex={false}
      />
      
      <PublicNavbar />
      
      <section className="pt-32 pb-12 px-6 lg:px-12 max-w-3xl mx-auto w-full text-center">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Book a <span className="text-indigo-600">Demo.</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          See how SchoolOS AI can transform your school's daily operations. Fill out the form below and our team will get in touch.
        </p>
      </section>

      <section className="pb-24 px-6 lg:px-12 max-w-3xl mx-auto w-full">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          {success ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Thank you for your interest in SchoolOS AI. One of our specialists will contact you shortly to schedule your personalized demo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                  <input 
                    type="text" required value={formData.schoolName}
                    onChange={e => setFormData({...formData, schoolName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Email</label>
                  <input 
                    type="email" required value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" required value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input 
                    type="text" required value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input 
                    type="text" required value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
                  <select
                    required value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select your role...</option>
                    <option value="Principal/Director">Principal / Director</option>
                    <option value="Administrator">Administrator</option>
                    <option value="IT Manager">IT Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Students</label>
                  <select
                    required value={formData.studentCount}
                    onChange={e => setFormData({...formData, studentCount: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select range...</option>
                    <option value="1-200">1 - 200</option>
                    <option value="201-500">201 - 500</option>
                    <option value="501-1000">501 - 1,000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Contact Method</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="contactMethod" value="email" checked={formData.contactMethod === "email"} onChange={e => setFormData({...formData, contactMethod: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="contactMethod" value="phone" checked={formData.contactMethod === "phone"} onChange={e => setFormData({...formData, contactMethod: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                    Phone
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Message (Optional)</label>
                <textarea 
                  rows={3} value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Any specific features you are looking for?"
                ></textarea>
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-lg mt-4"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Demo"}
              </button>
            </form>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
