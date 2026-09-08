import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Teacher, Student } from "../../types";
import { Users, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherClasses() {
  const { userData } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userData?.uid || !userData?.schoolId) return;
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid));
        let tData: Teacher | null = null;
        if (teacherDoc.exists()) {
          tData = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
          setTeacher(tData);
        }

        if (tData?.classes && tData.classes.length > 0) {
          const counts: Record<string, number> = {};
          
          for (const cls of tData.classes) {
            const [className, section] = cls.split("-");
            if (!className || !section) continue;
            
            const sq = query(
              collection(db, "students"), 
              where("schoolId", "==", userData.schoolId),
              where("class", "==", className.trim()),
              where("section", "==", section.trim())
            );
            const snap = await getDocs(sq);
            counts[cls] = snap.size;
          }
          setClassCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [userData]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading classes...</div>;
  if (!teacher) return <div className="p-8 text-center text-slate-500">Teacher profile not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
          <p className="text-slate-500 mt-1">Manage attendance, homework, and results for your assigned classes.</p>
        </div>
      </div>

      {!teacher.classes || teacher.classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Classes Assigned</h3>
          <p className="text-slate-500 mt-2">You have not been assigned to any classes yet. Please contact the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacher.classes.map(cls => {
            const [className, section] = cls.split("-");
            return (
              <Link 
                key={cls} 
                to={`/teacher/classes/${encodeURIComponent(cls)}`}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                    {classCounts[cls] || 0} Students
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Class {className}</h3>
                <p className="text-slate-500 font-medium">Section {section}</p>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-medium text-sm">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
