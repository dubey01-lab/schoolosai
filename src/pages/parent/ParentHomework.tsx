import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Student, Homework } from "../../types";
import { BookOpen } from "lucide-react";

export default function ParentHomework() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!userData?.uid) return;
      try {
        const q = query(collection(db, "students"), where("parentId", "==", userData.uid));
        const snap = await getDocs(q);
        const childData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
        setChildren(childData);
        if (childData.length > 0 && childData[0].id) {
          setSelectedChildId(childData[0].id);
        }
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    };
    fetchChildren();
  }, [userData]);

  useEffect(() => {
    const fetchHomework = async () => {
      if (!selectedChildId || !userData?.schoolId) return;
      setLoading(true);
      try {
        const child = children.find(c => c.id === selectedChildId);
        if (!child) return;
        
        const q = query(
          collection(db, "homework"),
          where("schoolId", "==", userData.schoolId),
          where("class", "==", child.class),
          where("section", "==", child.section)
        );
        const snap = await getDocs(q);
        setHomeworkList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Homework)).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));

      } catch (error) {
        console.error("Error fetching homework:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomework();
  }, [selectedChildId, userData, children]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Homework & Assignments</h2>
          <p className="text-slate-500 mt-1">Track daily homework assigned by teachers.</p>
        </div>
        
        {children.length > 1 && (
          <select 
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading homework...</div>
      ) : children.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500">No student profiles linked to your account.</p>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Homework Assigned</h3>
          <p className="text-slate-500 mt-2">There is no active homework for this class right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkList.map(hw => {
            const isOverdue = new Date(hw.dueDate) < new Date(new Date().setHours(0,0,0,0));
            return (
              <div key={hw.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{hw.title}</h3>
                    <p className="text-sm font-medium text-indigo-600">{hw.subject}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-3 pl-2 whitespace-pre-wrap">{hw.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 pl-2">
                  <span>Assigned on {new Date(hw.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-slate-700">Teacher ID: {hw.teacherId.slice(0, 6)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
