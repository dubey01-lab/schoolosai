import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { SupportTicket, SupportMessage } from "../../types";
import { MessageSquare, Check, Search, Filter, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminSupport() {
  const { userData } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  const fetchTickets = async () => {
    try {
      const q = query(collection(db, "support"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket?.id || !userData?.uid || !replyMessage.trim()) return;
    
    try {
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: userData.uid,
        senderRole: "SUPER_ADMIN",
        message: replyMessage,
        createdAt: new Date().toISOString()
      };
      
      const newStatus = selectedTicket.status === "OPEN" ? "IN_PROGRESS" : selectedTicket.status;

      await updateDoc(doc(db, "support", selectedTicket.id), {
        messages: arrayUnion(newMessage),
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      const updatedTicket = {
        ...selectedTicket,
        status: newStatus as any,
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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "support", id), { status: newStatus, updatedAt: new Date().toISOString() });
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">School Support Tickets</h2>
          <p className="text-slate-500 mt-1">Manage and respond to issues raised by school administrators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[700px] flex flex-col">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center bg-slate-50">
            All Tickets
            <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">{tickets.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No support tickets found.</div>
            ) : (
              tickets.map(ticket => (
                <button 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTicket?.id === ticket.id ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1 pr-2">{ticket.subject}</h4>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                      ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                      ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{ticket.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs font-medium text-indigo-600">{ticket.category}</p>
                    {ticket.priority === 'HIGH' && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded"><ShieldAlert className="w-3 h-3" /> HIGH</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 truncate">School ID: {ticket.schoolId}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm h-[700px] flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket ID: {selectedTicket.id} • School ID: <span className="font-mono text-xs">{selectedTicket.schoolId}</span></p>
                  </div>
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => updateStatus(selectedTicket.id!, e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_USER">Waiting for User</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {selectedTicket.messages?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'SUPER_ADMIN' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500">{msg.senderRole === 'SUPER_ADMIN' ? 'You' : 'Principal'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      msg.senderRole === 'SUPER_ADMIN' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to the principal..." 
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700">Reply</button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg text-slate-500">Select a support ticket</p>
              <p className="text-sm mt-2">View details and reply to the school administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
