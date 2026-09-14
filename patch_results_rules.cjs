const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

rules = rules.replace(
  "allow read: if (isAdmin() || isTeacher() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));",
  `allow read: if (isAdmin() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isAssignedToClass(get(/databases/$(database)/documents/students/$(resource.data.studentId)).data.class + '-' + get(/databases/$(database)/documents/students/$(resource.data.studentId)).data.section);`
);

fs.writeFileSync('firestore.rules', rules);
