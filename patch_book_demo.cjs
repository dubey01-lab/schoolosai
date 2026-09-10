const fs = require('fs');
let content = fs.readFileSync('src/pages/public/BookDemoPage.tsx', 'utf8');
content = content.replace(/studentsCount/g, 'studentCount');
fs.writeFileSync('src/pages/public/BookDemoPage.tsx', content);
