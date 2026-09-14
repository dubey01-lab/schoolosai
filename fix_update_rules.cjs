const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf-8');

const oldUpdate = `allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId');`;

const newUpdate = `allow update: if belongsToSchool(resource.data.get('schoolId', null)) && isOwnerTeacher(resource.data) && isOwnerTeacher(request.resource.data) && isUnchanged('schoolId') && isUnchanged('teacherId') && (request.resource.data.get('class', '') + '-' + request.resource.data.get('section', '') == '-' || isAssignedToClass(request.resource.data.get('class', '') + '-' + request.resource.data.get('section', '')));`;

rules = rules.split(oldUpdate).join(newUpdate);

fs.writeFileSync('firestore.rules', rules);
