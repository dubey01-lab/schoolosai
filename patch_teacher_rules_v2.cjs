const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const isAssigned = `
    function isAssignedToClass(classStr) {
      let teacherDoc = get(/databases/$(database)/documents/teachers/$(request.auth.uid));
      return teacherDoc != null && teacherDoc.data.classes.hasAny([classStr]);
    }
`;

if (!rules.includes('isAssignedToClass')) {
  rules = rules.replace('function isOwnerTeacher(data) {', isAssigned + '\n    function isOwnerTeacher(data) {');
}

rules = rules.replace(
  /allow create: if isTeacher\(\) && belongsToSchool\(request\.resource\.data\.get\('schoolId', null\)\) && isOwnerTeacher\(request\.resource\.data\);/g,
  "allow create: if isTeacher() && belongsToSchool(request.resource.data.get('schoolId', null)) && isOwnerTeacher(request.resource.data) && (request.resource.data.get('class', '') == '' || isAssignedToClass(request.resource.data.get('class', '') + '-' + request.resource.data.get('section', '')));"
);

fs.writeFileSync('firestore.rules', rules);
