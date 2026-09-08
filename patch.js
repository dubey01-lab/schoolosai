const fs = require('fs');
let text = fs.readFileSync('firestore.rules', 'utf8');
if (!text.includes('match /enquiries')) {
  text = text.substring(0, text.lastIndexOf('}')) + `
    // --- ENQUIRIES ---
    match /enquiries/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if isSuperAdmin();
    }
  }
`;
  fs.writeFileSync('firestore.rules', text);
}
