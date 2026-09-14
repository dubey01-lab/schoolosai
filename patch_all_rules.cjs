const fs = require('fs');

let content = fs.readFileSync('firestore.rules', 'utf-8');

// Replace belongsToSchool(resource.data.get('schoolId', null))
// with (resource == null || belongsToSchool(resource.data.get('schoolId', null)))
content = content.replace(/belongsToSchool\(resource\.data\.get\('schoolId', null\)\)/g, '(resource == null || belongsToSchool(resource.data.get(\'schoolId\', null)))');

// Also for users
content = content.replace(/resource\.data\.get\('schoolId', null\) == getUserSchoolId\(\)/g, '(resource == null || resource.data.get(\'schoolId\', null) == getUserSchoolId())');

fs.writeFileSync('firestore.rules', content);
