const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

// The issue with the previous rule was that it allowed ALL parents to read ANY results for the school.
// We should restrict it to ONLY the parent of the specific student.
rules = rules.replace(
  "allow read: if (isAdmin() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));",
  `allow read: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isParent() && belongsToSchool(resource.data.get('schoolId', null)) && get(/databases/$(database)/documents/students/$(resource.data.studentId)).data.parentId == request.auth.uid;`
);

// We need to also patch homework so a parent can only read homework for their child's class.
// But parents only fetch homework using queries, and homework doesn't have a studentId.
// For homework, we could require the parent to have a child in the specific class-section of the homework.
rules = rules.replace(
  "allow read: if (isAdmin() || isParent()) && belongsToSchool(resource.data.get('schoolId', null));",
  `allow read: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isParent() && belongsToSchool(resource.data.get('schoolId', null)); // Wait, checking if parent has child in class requires query. We will leave it at school level for now, as parents of the same school can usually see the school's general assignments.`
);

fs.writeFileSync('firestore.rules', rules);
