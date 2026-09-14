const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/TeacherDashboard.tsx', 'utf-8');

const originalFetch = `        const nQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId));
        const nSnap = await getDocs(nQ);
        setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5));`;

const newFetch = `        const nQ = query(collection(db, "notices"), where("schoolId", "==", userData.schoolId));
        const nSnap = await getDocs(nQ);
        setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5));

        // Fetch quick notes
        if (tData) {
          const notesQ = query(
            collection(db, "teacher_notes"),
            where("schoolId", "==", userData.schoolId),
            where("teacherId", "==", tData.id)
          );
          const notesSnap = await getDocs(notesQ);
          setQuickNotes(notesSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          }));
        }
`;

code = code.replace(originalFetch, newFetch);
fs.writeFileSync('src/pages/teacher/TeacherDashboard.tsx', code);
