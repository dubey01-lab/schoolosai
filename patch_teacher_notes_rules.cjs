const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const newRule = `
    // --- TEACHER NOTES ---
    match /teacher_notes/{noteId} {
      allow read: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
      allow create: if isTeacher() && belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data);
      allow update: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');
      allow delete: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data);
    }
`;

if (!rules.includes('match /teacher_notes')) {
  rules = rules.replace(/  }\n}\n?$/, newRule + '  }\n}\n');
  fs.writeFileSync('firestore.rules', rules);
  console.log('Added teacher_notes rules');
} else {
  console.log('teacher_notes rules already exist');
}
