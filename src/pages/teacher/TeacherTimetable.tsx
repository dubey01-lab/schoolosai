import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc , serverTimestamp } from "firebase/firestore";
import { Clock, MapPin, Users, Plus, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface TimetableSlot {
  id?: string;
  day: string;
  period: string;
  startTime: string;
  endTime: string;
  classStr: string;
  subject: string;
  room: string;
}

export default function TeacherTimetable() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() - 1] || "Monday");
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TimetableSlot>({
    day: "Monday", period: "1", startTime: "08:00", endTime: "09:00", classStr: "", subject: "", room: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    if (!userData?.uid || !userData?.schoolId) return;
    setLoading(true);
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

      if (tData?.id) {
        const tQ = query(collection(db, "timetable"), where("schoolId", "==", userData.schoolId), where("teacherId", "==", tData.id));
        const tSnap = await getDocs(tQ);
        const data = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as TimetableSlot));
        setTimetable(data);
        if (tData.classes && tData.classes.length > 0) {
          setFormData(prev => ({ ...prev, classStr: tData.classes[0], subject: tData.subject || "" }));
        }
      }
    } catch (err) {
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.schoolId || !teacher?.id) return;
    setSaving(true);
    try {
      const docRef = doc(collection(db, "timetable"));
      const payload = {
        schoolId: userData.schoolId,
        teacherId: teacher.id,
        ...formData
      };
      await setDoc(docRef, payload);
      toast.success("Period added to timetable");
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add period");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this period?")) return;
    try {
      await deleteDoc(doc(db, "timetable", id));
      setTimetable(prev => prev.filter(t => t.id !== id));
      toast.success("Period deleted");
    } catch (err) {
      toast.error("Failed to delete period");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading timetable...</div>;

  const currentDaySlots = timetable.filter(t => t.day === selectedDay).sort((a,b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Timetable</h2>
          <p className="text-slate-500 mt-1">Manage your weekly schedule.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Period"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
                <select required value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select required value={formData.classStr} onChange={e => setFormData({...formData, classStr: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  {teacher?.classes?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period (e.g. 1st)</label>
                <input required type="text" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room (Optional)</label>
                <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${selectedDay === day ? "border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="p-6">
          {currentDaySlots.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
              No classes scheduled for {selectedDay}.
            </div>
          ) : (
            <div className="space-y-4">
              {currentDaySlots.map(slot => (
                <div key={slot.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-all">
                  <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold uppercase opacity-80">Period</span>
                    <span className="text-xl font-black">{slot.period}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{slot.subject}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"><Users className="w-4 h-4 text-indigo-500" /> Class {slot.classStr}</span>
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"><Clock className="w-4 h-4 text-orange-500" /> {slot.startTime} - {slot.endTime}</span>
                      {slot.room && <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"><MapPin className="w-4 h-4 text-emerald-500" /> Room {slot.room}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(slot.id!)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
