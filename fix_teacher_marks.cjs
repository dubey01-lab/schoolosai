const fs = require('fs');

let text = fs.readFileSync('src/pages/teacher/TeacherMarks.tsx', 'utf-8');

text = text.replace(
    'subject: formSubject,',
    'subject: formSubject,\n          teacherId: teacher.id,'
);
fs.writeFileSync('src/pages/teacher/TeacherMarks.tsx', text);
