const fs = require('fs');

let content = fs.readFileSync('firestore.rules', 'utf-8');

// Notices write rule
content = content.replace(
    /match \/notices\/\{noticeId\} \{\n      allow read: if \(resource == null \|\| belongsToSchool\(resource\.data\.get\('schoolId', null\)\)\);\n      allow write: if isAdmin\(\) && belongsToSchool\(request\.resource\.data\.get\('schoolId', null\)\);\n    \}/g,
    "match /notices/{noticeId} {\n      allow read: if (resource == null || belongsToSchool(resource.data.get('schoolId', null)));\n      allow write: if (isAdmin() || isTeacher()) && belongsToSchool(request.resource.data.get('schoolId', null));\n    }"
);

const additionalRules = "\n    // --- TIMETABLE ---\n    match /timetable/{id} {\n      allow read: if (resource == null || belongsToSchool(resource.data.get('schoolId', null)));\n      allow write: if (isAdmin() || isTeacher()) && belongsToSchool(request.resource.data.get('schoolId', null));\n    }\n    \n    // --- CLASS PROGRESS ---\n    match /classProgress/{id} {\n      allow read: if (resource == null || belongsToSchool(resource.data.get('schoolId', null)));\n      allow write: if (isAdmin() || isTeacher()) && belongsToSchool(request.resource.data.get('schoolId', null));\n    }\n";

if (!content.includes('match /timetable/{id}')) {
    content = content.replace('    // --- CLASSES, SECTIONS, SUBJECTS ---', additionalRules + '\n    // --- CLASSES, SECTIONS, SUBJECTS ---');
    fs.writeFileSync('firestore.rules', content);
}
