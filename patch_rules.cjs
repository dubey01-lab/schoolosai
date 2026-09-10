const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const supportRules = `
    // --- SUPPORT ---
    match /support/{supportId} {
      allow read: if isSuperAdmin() || (isSignedIn() && resource.data.get('schoolId', null) == getUserSchoolId());
      allow write: if isSuperAdmin() || (isSignedIn() && request.resource.data.get('schoolId', null) == getUserSchoolId());
    }
  }
}
`;
rules = rules.replace('  }\n}', supportRules);
fs.writeFileSync('firestore.rules', rules);
console.log('Rules patched.');
