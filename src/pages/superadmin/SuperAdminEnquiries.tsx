import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { PlatformEnquiry } from "../../types";
import { MessageSquare, Phone, Mail, Globe, MapPin, Building, Calendar, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminEnquiries() {
  const [enquiries, setEnquiries] = useState<PlatformEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<PlatformEnquiry | null>(null);

  const fetchEnquiries = async () => {
    try {
      const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setEnquiries(snap.docs.map(d => ({ id: d.id, ...d.data() } as PlatformEnquiry)));
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "enquiries", id), { status: newStatus });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus as any } : e));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredEnquiries = filter === "ALL" ? enquiries : enquiries.filter(e => e.source === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Platform Enquiries</h2>
          <p className="text-slate-500 mt-1">Manage public contact and demo requests.</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button onClick={() => setFilter("ALL")} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${filter === "ALL" ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>All</button>
          <button onClick={() => setFilter("BOOK_DEMO")} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${filter === "BOOK_DEMO" ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Demos</button>
          <button onClick={() => setFilter("CONTACT")} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${filter === "CONTACT" ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Contacts</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[700px] flex flex-col">
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {loading ? (
              <div className="text-center p-8 text-slate-500">Loading enquiries...</div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No enquiries found.</div>
            ) : (
              filteredEnquiries.map(enq => (
                <div 
                  key={enq.id} 
                  onClick={() => setSelectedEnquiry(enq)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedEnquiry?.id === enq.id ? 'border-indigo-500 bg-indigo-50/30 shadow-sm' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${enq.source === 'BOOK_DEMO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {enq.source === 'BOOK_DEMO' ? 'Demo Request' : 'Contact'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      enq.status === 'NEW' ? 'bg-emerald-100 text-emerald-700' : 
                      enq.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>{enq.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{enq.name}</h4>
                  {enq.schoolName && <p className="text-xs font-medium text-indigo-600 truncate">{enq.schoolName}</p>}
                  <p className="text-xs text-slate-500 mt-1">{new Date(enq.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm h-[700px] flex flex-col overflow-hidden p-6">
          {selectedEnquiry ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEnquiry.name}</h3>
                  <div className="flex items-center gap-4 mt-3">
                    <a href={`mailto:${selectedEnquiry.email}`} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" /> {selectedEnquiry.email}
                    </a>
                    {selectedEnquiry.phone && (
                      <a href={`tel:${selectedEnquiry.phone}`} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" /> {selectedEnquiry.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedEnquiry.status} 
                    onChange={(e) => updateStatus(selectedEnquiry.id!, e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {selectedEnquiry.source === "BOOK_DEMO" && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institution</p>
                      <p className="font-medium text-slate-900 flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> {selectedEnquiry.schoolName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                      <p className="font-medium text-slate-900">{selectedEnquiry.role || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                      <p className="font-medium text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedEnquiry.city}, {selectedEnquiry.country}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Students</p>
                      <p className="font-medium text-slate-900">{selectedEnquiry.studentCount || "Not specified"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {selectedEnquiry.source === "CONTACT" ? "Message" : "Requirements / Notes"}
                  </p>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message || "No message provided."}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg text-slate-500">Select an enquiry</p>
              <p className="text-sm mt-2">View details and manage status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
