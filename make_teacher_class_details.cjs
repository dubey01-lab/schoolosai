const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Search, User, Filter, CalendarCheck, BookOpen, FileText } from "lucide-react";
import { Student } from "../../types";

export default function TeacherClassDetails() {
  const { classId } = useParams();
  const { userData } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacher, setTeacher] = useState<any>(null);

  const [className, section] = classId ? classId.split("-") : ["", ""];

  useEffect(() => {
    const fetchStudents = async () => {
      if (!userData?.schoolId || !classId) return;
      try {
        let tData = null;
        const teacherDoc = await getDoc(doc(db, "teachers", userData.uid!));
        if (teacherDoc.exists()) {
          tData = { id: teacherDoc.id, ...teacherDoc.data() };
        } else {
          const tQ = query(collection(db, "teachers"), where("email", "==", userData.email), where("schoolId", "==", userData.schoolId));
          const tSnap = await getDocs(tQ);
          if (!tSnap.empty) tData = { id: tSnap.docs[0].id, ...tSnap.docs[0].data() };
        }
        setTeacher(tData);

        if (tData?.classes?.includes(classId)) {
          const sq = query(
            collection(db, "students"),
            where("schoolId", "==", userData.schoolId),
            where("class", "==", className),
            where("section", "==", section)
          );
          const snap = await getDocs(sq);
          const sData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)).sort((a,b) => (a.rollNumber || "").localeCompare(b.rollNumber || ""));
          setStudents(sData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classId, userData]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading students...</div>;

  if (!teacher?.classes?.includes(classId!)) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
        <p>You are not assigned to this class. Please contact the administrator.</p>
        <Link to="/teacher/classes" className="mt-6 inline-block text-indigo-600 font-medium hover:text-indigo-700">Back to My Classes</Link>
      </div>
    );
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/teacher/classes" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Class {className} - Section {section}</h2>
          <p className="text-slate-500 mt-1">{students.length} students enrolled</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/teacher/attendance" className="flex-1 sm:flex-none px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors">
              <CalendarCheck className="w-4 h-4" /> Attendance
            </Link>
            <Link to="/teacher/marks" className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
              <FileText className="w-4 h-4" /> Marks
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Roll No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm">
                        {student.rollNumber || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="font-medium text-slate-900">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-slate-700">{student.parentName || "-"}</p>
                        <p className="text-slate-500 text-xs">{student.parentPhone || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/teacher/TeacherClassDetails.tsx', content);
