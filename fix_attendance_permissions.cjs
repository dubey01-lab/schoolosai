const fs = require('fs');
let text = fs.readFileSync('src/pages/teacher/TeacherAttendance.tsx', 'utf-8');

text = text.replace(
    'const attRef = doc(db, "attendance", `${userData.schoolId}_${selectedClass}_${date}`);',
    'const attId = `${userData.schoolId}_${selectedClass}_${date}`;'
);
text = text.replace(
    'const attSnap = await getDoc(attRef);',
    'const attRef = doc(db, "attendance", attId);\n      const attSnap = await getDoc(attRef).catch(err => { if (err.code === "permission-denied") return null; throw err; });'
);
text = text.replace(
    'if (attSnap.exists()) {',
    'if (attSnap && attSnap.exists()) {'
);
text = text.replace(
    'const existingData = attSnap.data() as any;',
    'const existingData = attSnap!.data() as any;'
);

fs.writeFileSync('src/pages/teacher/TeacherAttendance.tsx', text);
