const fs = require('fs');

let content = fs.readFileSync('firestore.rules', 'utf-8');

// For attendance
content = content.replace(
    "allow read: if belongsToSchool(resource.data.get('schoolId', null)) && (isAdmin() || isTeacher());",
    "allow read: if (resource == null || belongsToSchool(resource.data.get('schoolId', null))) && (isAdmin() || isTeacher());"
);

// Do the same for others if they have the same pattern (e.g. exams, results)
content = content.replace(
    "allow read: if belongsToSchool(resource.data.get('schoolId', null));",
    "allow read: if (resource == null || belongsToSchool(resource.data.get('schoolId', null)));"
);

fs.writeFileSync('firestore.rules', content);
