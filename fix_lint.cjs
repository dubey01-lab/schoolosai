const fs = require('fs');

function fix(file, type) {
    let content = fs.readFileSync(file, 'utf-8');
    if (type === 'student') {
        content = content.replace(/DOB: s\.dateOfBirth,/g, 'DOB: s.dob,');
    } else if (type === 'teacher') {
        content = content.replace(/Experience: t\.experience,/g, '');
    }
    fs.writeFileSync(file, content);
}

fix('src/pages/admin/AdminStudents.tsx', 'student');
fix('src/pages/admin/AdminTeachers.tsx', 'teacher');
