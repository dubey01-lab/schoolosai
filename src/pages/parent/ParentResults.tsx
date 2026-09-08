import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Student, ExamResult, Exam } from "../../types";
import { FileText, Download } from "lucide-react";

export default function ParentResults() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [results, setResults] = useState<(ExamResult & { examDetails?: Exam })[]>([]);

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
    const fetchResults = async () => {
      if (!selectedChildId || !userData?.schoolId) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "results"),
          where("schoolId", "==", userData.schoolId),
          where("studentId", "==", selectedChildId)
        );
        const snap = await getDocs(q);
        const resultsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
        
        // Fetch exam details for each result
        const enhancedResults = await Promise.all(resultsData.map(async (res) => {
          try {
            const examDoc = await getDoc(doc(db, "exams", res.examId));
            if (examDoc.exists()) {
              return { ...res, examDetails: { id: examDoc.id, ...examDoc.data() } as Exam };
            }
          } catch (e) {
            console.error(e);
          }
          return res;
        }));
        
        setResults(enhancedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedChildId, userData]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Academic Results</h2>
          <p className="text-slate-500 mt-1">View examination performance and report cards.</p>
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
        <div className="p-8 text-center text-slate-500">Loading results...</div>
      ) : children.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500">No student profiles linked to your account.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Results Found</h3>
          <p className="text-slate-500 mt-2">There are no exam results published for this student yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map(result => (
            <div key={result.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{result.examDetails?.title || "Examination"}</h3>
                  <p className="text-sm text-slate-500 mt-1">Held on {result.examDetails ? new Date(result.examDetails.date).toLocaleDateString() : "Unknown date"}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" /> Print
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Total Marks</p>
                    <p className="text-2xl font-bold text-slate-900">{result.total}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-sm font-medium text-emerald-600 mb-1">Percentage</p>
                    <p className="text-2xl font-bold text-slate-900">{result.percentage}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                    <p className="text-sm font-medium text-amber-600 mb-1">Grade</p>
                    <p className="text-2xl font-bold text-slate-900">{result.grade}</p>
                  </div>
                </div>

                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-sm text-slate-500 font-medium">
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Marks Obtained</th>
                      <th className="px-6 py-3">Maximum Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(result.marks).map(([subject, marks]) => (
                      <tr key={subject} className="text-sm hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{subject}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{marks}</td>
                        <td className="px-6 py-4 text-slate-500">{result.maxMarks[subject]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
