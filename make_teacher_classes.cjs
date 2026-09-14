const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Users, ChevronRight, BookOpen, CalendarCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherClasses() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userData?.uid || !userData?.schoolId) return;
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
        
        if (tData) {
          setTeacher(tData);
          if (tData.classes && tData.classes.length > 0) {
            const counts: Record<string, number> = {};
            for (const cls of tData.classes) {
              const [className, section] = cls.split("-");
              if (!className || !section) continue;
              const sq = query(collection(db, "students"), where("schoolId", "==", userData.schoolId), where("class", "==", className.trim()), where("section", "==", section.trim()));
              const snap = await getDocs(sq);
              counts[cls] = snap.size;
            }
            setClassCounts(counts);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [userData]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading classes...</div>;
  if (!teacher) return <div className="p-12 text-center text-slate-500">Teacher profile not found. Please contact administration.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
        <p className="text-slate-500 mt-1">Manage your assigned classes, students, and activities.</p>
      </div>

      {!teacher.classes || teacher.classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Classes Assigned</h3>
          <p className="text-slate-500 mt-2">You have not been assigned to any classes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacher.classes.map((cls: string) => {
            const [className, section] = cls.split("-");
            return (
              <div key={cls} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                    {classCounts[cls] || 0} Students
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Class {className}</h3>
                <p className="text-slate-500 font-medium">Section {section} • {teacher.subject || "General"}</p>
                
                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link to={"/teacher/classes/" + encodeURIComponent(cls)} className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
                    <Users className="w-4 h-4" /> Students
                  </Link>
                  <Link to="/teacher/attendance" className="flex items-center justify-center gap-2 py-2 px-3 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors">
                    <CalendarCheck className="w-4 h-4" /> Attendance
                  </Link>
                  <Link to="/teacher/homework" className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                    <BookOpen className="w-4 h-4" /> Homework
                  </Link>
                  <Link to="/teacher/marks" className="flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors">
                    <FileText className="w-4 h-4" /> Marks
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherClasses.tsx', content);
