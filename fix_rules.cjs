const fs = require('fs');

let content = fs.readFileSync('firestore.rules', 'utf-8');

// Fix broken request.(resource == null ...)
content = content.replace(/request\.\(resource == null \|\| resource\.data\.get\('schoolId', null\) == getUserSchoolId\(\)\)/g, "request.resource.data.get('schoolId', null) == getUserSchoolId()");

// Fix (resource == null || (resource == null ||
content = content.replace(/\(resource == null \|\| \(resource == null \|\| belongsToSchool\(resource\.data\.get\('schoolId', null\)\)\)\)/g, "(resource == null || belongsToSchool(resource.data.get('schoolId', null)))");

fs.writeFileSync('firestore.rules', content);
