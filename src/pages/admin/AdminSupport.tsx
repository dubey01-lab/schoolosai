import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { SupportTicket, SupportMessage } from "../../types";
import { MessageSquare, Plus, Check, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSupport() {
  const { userData } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  const [newTicket, setNewTicket] = useState({ subject: "", category: "GENERAL", priority: "MEDIUM", message: "" });
  const [replyMessage, setReplyMessage] = useState("");
  
  const fetchTickets = async () => {
    if (!userData?.schoolId) return;
    try {
      const q = query(collection(db, "support"), where("schoolId", "==", userData.schoolId));
      const snap = await getDocs(q);
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userData]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !userData?.uid) return;
    
    try {
      const ticketData = {
        schoolId: userData.schoolId,
        subject: newTicket.subject,
        category: newTicket.category,
        priority: newTicket.priority,
        message: newTicket.message,
        status: "OPEN",
        createdBy: userData.uid,
        createdByRole: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [{
          id: Math.random().toString(36).substr(2, 9),
          senderId: userData.uid,
          senderRole: userData.role,
          message: newTicket.message,
          createdAt: new Date().toISOString()
        }]
      };
      
      const docRef = await addDoc(collection(db, "support"), ticketData);
      setTickets([{ id: docRef.id, ...ticketData } as SupportTicket, ...tickets]);
      setShowCreateModal(false);
      setNewTicket({ subject: "", category: "GENERAL", priority: "MEDIUM", message: "" });
      toast.success("Support ticket created");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket?.id || !userData?.uid || !replyMessage.trim()) return;
    
    try {
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: userData.uid,
        senderRole: userData.role,
        message: replyMessage,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, "support", selectedTicket.id), {
        messages: arrayUnion(newMessage),
        updatedAt: new Date().toISOString()
      });
      
      const updatedTicket = {
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), newMessage],
        updatedAt: new Date().toISOString()
      };
      
      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setReplyMessage("");
      toast.success("Reply sent");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Help & Support</h2>
          <p className="text-slate-500 mt-1">Contact Super Admin for technical and operational support.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
          <Plus className="w-5 h-5" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center bg-slate-50">
            My Tickets
            <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">{tickets.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No support tickets found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <button 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{ticket.subject}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                        ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{ticket.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs font-medium text-indigo-600">{ticket.category} • {ticket.priority} Priority</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket ID: {selectedTicket.id}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    selectedTicket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                    selectedTicket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    selectedTicket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{selectedTicket.status}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {selectedTicket.messages?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === userData?.uid ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">{msg.senderRole === 'SUPER_ADMIN' ? 'SchoolOS Support' : 'You'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      msg.senderId === userData?.uid 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <form onSubmit={handleReply} className="flex gap-3">
                    <input 
                      type="text" 
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..." 
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">Send</button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg text-slate-500">Select a support ticket</p>
              <p className="text-sm mt-2">Choose a ticket from the left or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">New Support Ticket</h3>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input required type="text" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="GENERAL">General</option>
                    <option value="TECHNICAL">Technical Issue</option>
                    <option value="ACCOUNT">Account/Login</option>
                    <option value="FEES">Fees/Payments</option>
                    <option value="STUDENT">Student Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required rows={4} value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" placeholder="Please describe your issue in detail..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
