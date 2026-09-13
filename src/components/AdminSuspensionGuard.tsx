import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AlertTriangle, Send, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSuspensionGuard({ children }: { children: React.ReactNode }) {
  const { userData, logout } = useAuth();
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!userData?.schoolId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "schools", userData.schoolId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'SUSPENDED') {
          setIsSuspended(true);
        } else {
          setIsSuspended(false);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userData?.schoolId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userData?.schoolId) return;
    
    setSending(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        schoolId: userData.schoolId,
        senderId: userData.uid,
        senderEmail: userData.email,
        senderRole: userData.role,
        message: message,
        status: "OPEN",
        createdAt: serverTimestamp(),
        type: "SUSPENSION_APPEAL"
      });
      setSent(true);
      toast.success("Message sent to Super Admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Checking school status...</div>;

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100">
          <div className="bg-rose-500 p-8 flex flex-col items-center justify-center text-white relative">
            <div className="absolute top-4 right-4 cursor-pointer text-rose-200 hover:text-white text-sm font-medium" onClick={logout}>
              Logout
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center">Account Suspended</h2>
            <p className="text-rose-100 text-center mt-2 text-sm">
              Your school's dashboard access has been suspended by the Super Admin. Please contact them to restore access.
            </p>
          </div>
          
          <div className="p-8">
            {sent ? (
              <div className="text-center py-6 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Message Sent</h3>
                <p className="text-slate-500 text-sm mt-1">The Super Admin will review your appeal shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message to Super Admin
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-sm resize-none"
                    placeholder="Explain your situation or ask for reactivation..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
                >
                  {sending ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Don't worry, your school's data is safe. Teachers and Parents can continue using their apps normally. Only Admin access is restricted.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
