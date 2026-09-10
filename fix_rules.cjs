const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf-8');

content = content.replace(
  /allow create: if isSignedIn\(\) && request\.auth\.uid == userId;/g,
  `allow create: if isSignedIn() && request.auth.uid == userId && request.resource.data.get('role', '') != 'SUPER_ADMIN';`
);

fs.writeFileSync('firestore.rules', content);
