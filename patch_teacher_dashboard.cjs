const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/TeacherDashboard.tsx', 'utf-8');

// 1. Update imports
code = code.replace(
  'import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";',
  'import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";'
);
code = code.replace(
  'import { Users, CalendarCheck, BookOpen, Bell, CheckCircle2, Clock, FileText, LayoutDashboard, ArrowRight } from "lucide-react";',
  'import { Users, CalendarCheck, BookOpen, Bell, CheckCircle2, Clock, FileText, LayoutDashboard, ArrowRight, Trash2, Plus } from "lucide-react";'
);

// 2. Add state
const stateBlock = `
  const [notices, setNotices] = useState<any[]>([]);
  const [activeClasses, setActiveClasses] = useState<string[]>([]);
  
  // Quick Notes State
  const [quickNotes, setQuickNotes] = useState<any[]>([]);
  const [newNoteClass, setNewNoteClass] = useState<string>("");
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [savingNote, setSavingNote] = useState(false);
`;
code = code.replace(
  /const \[notices, setNotices\] = useState<any\[\]>\(\[\]\);\s*const \[activeClasses, setActiveClasses\] = useState<string\[\]>\(\[\]\);/,
  stateBlock
);

// 3. Fetch notes
const fetchBlock = `
        // Fetch notices
        const nQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId));
        const nSnap = await getDocs(nQ);
        const fetchedNotices = nSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => b.createdAt - a.createdAt)
          .slice(0, 5);
        setNotices(fetchedNotices);

        // Fetch quick notes
        if (tData) {
          const notesQ = query(
            collection(db, "teacher_notes"),
            where("schoolId", "==", userData.schoolId),
            where("teacherId", "==", tData.id)
          );
          const notesSnap = await getDocs(notesQ);
          const fetchedNotes = notesSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          setQuickNotes(fetchedNotes);
        }
`;
code = code.replace(
  /const nQ = query\(collection\(db, "notices"\), where\("schoolId", "==", userData\.schoolId\)\);\s*const nSnap = await getDocs\(nQ\);\s*const fetchedNotices = nSnap\.docs\s*\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\s*\.sort\(\(a: any, b: any\) => b\.createdAt - a\.createdAt\)\s*\.slice\(0, 5\);\s*setNotices\(fetchedNotices\);/,
  fetchBlock
);

// 4. Add handlers
const handlersBlock = `
  const handleSaveNote = async () => {
    if (!newNoteClass || !newNoteContent.trim() || !teacher) return;
    setSavingNote(true);
    try {
      const noteData = {
        schoolId: userData.schoolId,
        teacherId: teacher.id,
        classStr: newNoteClass,
        content: newNoteContent.trim(),
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "teacher_notes"), noteData);
      setQuickNotes([{ id: docRef.id, ...noteData, createdAt: { toMillis: () => Date.now() } }, ...quickNotes]);
      setNewNoteContent("");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, "teacher_notes", noteId));
      setQuickNotes(quickNotes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note.");
    }
  };

  if (loading) {
`;
code = code.replace(
  '  if (loading) {',
  handlersBlock
);

// 5. Setup default newNoteClass when activeClasses loads
code = code.replace(
  'setActiveClasses(classes);',
  'setActiveClasses(classes);\n        if (classes.length > 0) setNewNoteClass(classes[0]);'
);

// 6. UI insertion
const uiBlock = `
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Notes</h3>
              <div className="space-y-3">
                <select
                  value={newNoteClass}
                  onChange={(e) => setNewNoteClass(e.target.value)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {activeClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls.replace('-', ' Section ')}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Type a quick note..."
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || !newNoteContent.trim() || !newNoteClass}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {quickNotes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No notes yet.</div>
              ) : (
                quickNotes.map(note => (
                  <div key={note.id} className="p-4 hover:bg-slate-50 transition-colors group flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md mb-1">
                        {note.classStr.replace('-', ' ')}
                      </span>
                      <p className="text-sm text-slate-700">{note.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
`;

code = code.replace(
  '        <div className="space-y-6">\n          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">',
  uiBlock
);

fs.writeFileSync('src/pages/teacher/TeacherDashboard.tsx', code);
