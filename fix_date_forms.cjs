const fs = require('fs');
const files = [
    'src/pages/teacher/TeacherHomework.tsx',
    'src/pages/teacher/TeacherNotices.tsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Using string replacement to clean up the bad replacements that might have occurred
    // Ensure form initialization for date uses normal date logic.
    content = content.replace(
        /serverTimestamp\(\)\.split\('T'\)\[0\]/g,
        "new Date().toISOString().split('T')[0]"
    );
    
    // In teacher homework, make sure assignedDate and dueDate use ISO strings for form inputs
    content = content.replace(
        /assignedDate: serverTimestamp\(\)\.split\('T'\)\[0\]/g,
        'assignedDate: new Date().toISOString().split("T")[0]'
    );
    
    fs.writeFileSync(file, content);
}
