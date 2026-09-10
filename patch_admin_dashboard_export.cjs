const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace('stats.totalStudents', 'stats.students');
code = code.replace('stats.totalTeachers', 'stats.teachers');
code = code.replace('stats.totalFees', 'stats.feesCollected');

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
