const fs = require('fs');
const content = fs.readFileSync('src/pages/admin/AdminExams.tsx', 'utf-8');

// To avoid excessive complexity, we can navigate Admin to a new page like /admin/exams/:id/results 
// But wait, there is no such page in routes! 
