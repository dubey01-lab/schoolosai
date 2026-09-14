const fs = require('fs');
let content = fs.readFileSync('src/pages/teacher/TeacherAttendance.tsx', 'utf-8');
content = content.replace(/const attRef = doc\(db, "attendance", attId\);\n\s*const attRef = doc\(db, "attendance", attId\);/g, 'const attRef = doc(db, "attendance", attId);');
fs.writeFileSync('src/pages/teacher/TeacherAttendance.tsx', content);
