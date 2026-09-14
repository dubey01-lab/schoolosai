const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/TeacherDashboard.tsx', 'utf-8');

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

  if (loading) return
`;

code = code.replace(
  '  if (loading) return',
  handlersBlock
);

fs.writeFileSync('src/pages/teacher/TeacherDashboard.tsx', code);
