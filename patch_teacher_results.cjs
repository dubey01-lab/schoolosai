const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/TeacherClassDetails.tsx', 'utf8');

// Add states
const statesToAdd = `
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
`;
content = content.replace('const [savingAttendance, setSavingAttendance] = useState(false);', 'const [savingAttendance, setSavingAttendance] = useState(false);\n' + statesToAdd);

// Add fetchExams
const fetchExams = `
    const fetchExams = async () => {
      if (!userData?.schoolId || !className) return;
      try {
        const q = query(collection(db, "exams"), where("schoolId", "==", userData.schoolId), where("class", "==", className), where("section", "==", section));
        const snap = await getDocs(q);
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {
        console.error(e);
      }
    };
    fetchExams();
`;
content = content.replace('fetchStudents();', 'fetchStudents();\n' + fetchExams);

// Replace Results UI
const resultsUI = `
          {activeTab === 'RESULTS' && (
            <div className="space-y-6">
              {exams.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No Exams Found</h3>
                  <p className="text-slate-500 mt-2">No exams have been scheduled for this class by the administrator.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {exams.map(exam => (
                      <div 
                        key={exam.id} 
                        onClick={() => setSelectedExam(exam)}
                        className={\`p-4 rounded-xl border cursor-pointer transition-colors \${selectedExam?.id === exam.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}\`}
                      >
                        <h4 className="font-bold text-slate-900">{exam.title}</h4>
                        <p className="text-sm text-slate-500">{new Date(exam.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  {selectedExam && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                        Enter Marks: {selectedExam.title}
                      </div>
                      <div className="p-4">
                        <p className="text-slate-500 text-sm mb-4">Results management is available for administrators in this version. Ask your administrator to upload results.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
`;
content = content.replace(/\{activeTab === 'RESULTS' && \([\s\S]*?\}\)/, resultsUI.trim());

fs.writeFileSync('src/pages/teacher/TeacherClassDetails.tsx', content);
console.log('Results tab patched.');
