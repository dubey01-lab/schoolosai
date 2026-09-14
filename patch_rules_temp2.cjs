const fs = require('fs');

const original = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;
fs.writeFileSync('firestore-temp.rules', original);
