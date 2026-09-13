const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/TeacherClassDetails.tsx', 'utf-8');

const resultsStart = content.indexOf("{activeTab === 'RESULTS' && (");
const resultsEnd = content.indexOf(")}", resultsStart) + 2;

if (resultsStart !== -1 && resultsEnd !== -1) {
    const resultsView = `
          {activeTab === 'RESULTS' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Results Entry</h3>
                    <select 
                       className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                       onChange={(e) => {
                          const ex = exams.find(x => x.id === e.target.value);
                          setSelectedExam(ex || null);
                       }}
                       value={selectedExam?.id || ""}
                    >
                       <option value="">Select Exam</option>
                       {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} - {new Date(ex.date).toLocaleDateString()}</option>)}
                    </select>
                </div>
                
                {selectedExam ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                 <tr className="text-sm font-medium text-slate-500">
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Roll No</th>
                                    {selectedExam.subjects.map((sub: string) => (
                                        <th key={sub} className="px-4 py-3">{sub} (Max 100)</th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {students.map(student => (
                                    <tr key={student.id}>
                                       <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                                       <td className="px-4 py-3 text-slate-500">{student.rollNumber}</td>
                                       {selectedExam.subjects.map((sub: string) => (
                                          <td key={sub} className="px-4 py-3">
                                             <input 
                                                type="number" 
                                                min="0" max="100"
                                                className="w-20 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                value={(marksData as any)[student.id!]?.[sub] || ''}
                                                onChange={(e) => {
                                                   setMarksData(prev => ({
                                                      ...prev,
                                                      [student.id!]: {
                                                         ...((prev as any)[student.id!] || {}),
                                                         [sub]: e.target.value
                                                      }
                                                   }));
                                                }}
                                             />
                                          </td>
                                       ))}
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                        <div className="flex justify-end mt-4">
                           <button onClick={handleSaveResults} disabled={savingAttendance} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                              {savingAttendance ? "Saving..." : "Save Marks"}
                           </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8">
                       <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <p className="text-slate-500">Please select an exam to enter marks.</p>
                       {exams.length === 0 && <p className="text-sm text-amber-600 mt-2">No exams found for this class.</p>}
                    </div>
                )}
              </div>
            </div>
          )}
    `;
    
    // There might be multiple closing brackets, so let's just replace the exact text
    const textToReplace = `          {activeTab === 'RESULTS' && (
            <div className="text-center p-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Results Management</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Select an exam created by the administrator to enter marks for this class. 
                Results management is available for administrators in this version. Please contact your admin.
              </p>
            </div>
          )}`;
    
    content = content.replace(textToReplace, resultsView);
    fs.writeFileSync('src/pages/teacher/TeacherClassDetails.tsx', content);
}
