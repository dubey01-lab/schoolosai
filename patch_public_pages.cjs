const fs = require('fs');

// Patch BookDemoPage.tsx
let bookDemo = fs.readFileSync('src/pages/public/BookDemoPage.tsx', 'utf8');
bookDemo = bookDemo.replace('type: "demo"', 'source: "BOOK_DEMO"');
bookDemo = bookDemo.replace('createdAt: serverTimestamp()', 'createdAt: new Date().toISOString()');
bookDemo = bookDemo.replace('studentsCount:', 'studentCount:');
fs.writeFileSync('src/pages/public/BookDemoPage.tsx', bookDemo);

// Patch ContactPage.tsx
let contact = fs.readFileSync('src/pages/public/ContactPage.tsx', 'utf8');
contact = contact.replace('type: "contact"', 'source: "CONTACT"');
contact = contact.replace('createdAt: serverTimestamp()', 'createdAt: new Date().toISOString()');
fs.writeFileSync('src/pages/public/ContactPage.tsx', contact);

console.log('Public pages patched.');
