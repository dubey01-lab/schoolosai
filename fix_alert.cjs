const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/TeacherAttendance.tsx', 'utf-8');
code = code.replace('UserMinus, Save }', 'UserMinus, Save, AlertCircle }');
fs.writeFileSync('src/pages/teacher/TeacherAttendance.tsx', code);
