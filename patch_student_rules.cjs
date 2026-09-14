const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

// Replace student read rule
rules = rules.replace(
  "allow read: if (isAdmin() || isTeacher()) && belongsToSchool(resource.data.get('schoolId', null));",
  `allow read: if isAdmin() && belongsToSchool(resource.data.get('schoolId', null));
      allow read: if isTeacher() && belongsToSchool(resource.data.get('schoolId', null)) && isAssignedToClass(resource.data.get('class', '') + '-' + resource.data.get('section', ''));`
);

fs.writeFileSync('firestore.rules', rules);
