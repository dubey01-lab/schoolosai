const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes('match /enquiries')) {
  rules = rules.replace(
    '}',
    `
    // --- ENQUIRIES ---
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if isSuperAdmin();
    }
  }
`
  );
  fs.writeFileSync('firestore.rules', rules);
}
