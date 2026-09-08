import React, { useState } from "react";
import { ArrowLeft, Send, Save, Calendar, Clock, Sparkles, Image, CheckCircle2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notice } from "../../types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AdminNoticeCreate() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as { title?: string, content?: string } | null;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: prefill?.title || "",
    content: prefill?.content || "",
    audience: "ALL_PARENTS",
    targetClass: "",
    targetSection: "",
    publishType: "NOW",
    scheduledDate: "",
    scheduledTime: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (status: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }
    
    if (status === "SCHEDULED" && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast.error("Schedule date and time are required");
      return;
    }

    setLoading(true);
    try {
      let scheduleDateTime = null;
      if (status === "SCHEDULED") {
        scheduleDateTime = new Date(formData.scheduledDate + "T" + formData.scheduledTime).toISOString();
      }

      const notice: Partial<Notice> = {
        schoolId: userData!.schoolId,
        title: formData.title,
        content: formData.content,
        audience: formData.audience as any,
        targetClass: formData.targetClass || undefined,
        targetSection: formData.targetSection || undefined,
        status: status,
        publishDate: status === "PUBLISHED" ? new Date().toISOString() : undefined,
        scheduledDate: scheduleDateTime || undefined,
        authorId: userData!.uid,
        authorName: userData!.name,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "notices"), notice);
      
      toast.success(
        status === "PUBLISHED" ? "Notice published successfully!" :
        status === "SCHEDULED" ? "Notice scheduled successfully!" :
        "Draft saved successfully!"
      );
      navigate("/admin/notices");
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error("Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/notices" className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create Notice</h2>
          <p className="text-slate-500 mt-1">Compose a new message for your school community.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notice Title</label>
              <input 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual Sports Day Announcement"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-medium placeholder:font-normal"
              />
            </div>

            {/* Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                <select 
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700"
                >
                  <option value="ALL_PARENTS">All Parents</option>
                  <option value="ALL_STUDENTS">All Students</option>
                  <option value="ALL_TEACHERS">All Teachers</option>
                  <option value="SPECIFIC_CLASS">Specific Class</option>
                </select>
              </div>
              
              {formData.audience === "SPECIFIC_CLASS" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
                  <div className="flex gap-2">
                    <input 
                      name="targetClass"
                      value={formData.targetClass}
                      onChange={handleChange}
                      placeholder="Class (e.g. 10)"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                    />
                    <input 
                      name="targetSection"
                      value={formData.targetSection}
                      onChange={handleChange}
                      placeholder="Sec (e.g. A)"
                      className="w-24 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-slate-700">Message Content</label>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors">
                  <Sparkles className="w-3 h-3" /> Enhance with AI
                </button>
              </div>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your notice here..."
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[240px] resize-y text-slate-700 leading-relaxed"
              />
              <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    <Image className="w-4 h-4" /> Add Attachment
                  </button>
                </div>
                <span>{formData.content.length} characters</span>
              </div>
            </div>

            {/* Publish Options */}
            <div className="border-t border-slate-100 pt-6">
               <label className="block text-sm font-medium text-slate-700 mb-3">Publish Settings</label>
               <div className="flex gap-4">
                 <label className={"flex-1 border rounded-xl p-4 cursor-pointer transition-all " + (formData.publishType === 'NOW' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300')}>
                   <div className="flex items-center gap-3">
                     <input type="radio" name="publishType" value="NOW" checked={formData.publishType === 'NOW'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                     <div>
                       <p className="font-medium text-slate-900">Publish Now</p>
                       <p className="text-xs text-slate-500 mt-0.5">Send immediately to all recipients</p>
                     </div>
                   </div>
                 </label>
                 <label className={"flex-1 border rounded-xl p-4 cursor-pointer transition-all " + (formData.publishType === 'LATER' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300')}>
                   <div className="flex items-center gap-3">
                     <input type="radio" name="publishType" value="LATER" checked={formData.publishType === 'LATER'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                     <div>
                       <p className="font-medium text-slate-900">Schedule for Later</p>
                       <p className="text-xs text-slate-500 mt-0.5">Set a specific date and time</p>
                     </div>
                   </div>
                 </label>
               </div>
               
               {formData.publishType === 'LATER' && (
                 <div className="mt-4 flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="time" name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button 
                disabled={loading}
                onClick={() => handleSave("DRAFT")}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save as Draft
              </button>
              <button 
                disabled={loading}
                onClick={() => handleSave(formData.publishType === 'NOW' ? 'PUBLISHED' : 'SCHEDULED')}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 flex items-center gap-2"
              >
                {formData.publishType === 'NOW' ? <Send className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {formData.publishType === 'NOW' ? 'Publish Notice' : 'Schedule Notice'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Preview</h3>
            
            {/* Mobile Preview Frame */}
            <div className="w-[320px] mx-auto bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
               {/* Phone Notch */}
               <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-20"></div>
               
               {/* App Header */}
               <div className="bg-indigo-600 pt-12 pb-4 px-4 text-white z-10 shrink-0 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                     <ArrowLeft className="w-4 h-4" />
                   </div>
                   <span className="font-medium text-sm">Notice Details</span>
                 </div>
               </div>

               {/* App Content */}
               <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                 <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                   <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">SCHOOL NOTICE</span>
                     <span className="text-[10px] text-slate-400 font-medium">
                       {formData.publishType === 'NOW' ? format(new Date(), 'MMM d, yyyy') : 
                        formData.scheduledDate ? format(new Date(formData.scheduledDate), 'MMM d, yyyy') : 'Date'}
                     </span>
                   </div>
                   
                   <h1 className="text-lg font-bold text-slate-900 leading-snug mb-3">
                     {formData.title || "Your notice title will appear here"}
                   </h1>
                   
                   <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                     {formData.content || "Start typing in the editor to see your message preview."}
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                       {userData?.name?.charAt(0) || "A"}
                     </div>
                     <div>
                       <p className="text-xs font-semibold text-slate-900">{userData?.name || "Admin Name"}</p>
                       <p className="text-[10px] text-slate-500">{userData?.role === 'ADMIN' ? 'Principal' : 'Admin'}</p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
