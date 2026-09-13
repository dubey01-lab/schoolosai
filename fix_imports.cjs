const fs = require('fs');

function fix(file) {
    let content = fs.readFileSync(file, 'utf-8');
    content = `import { downloadCSV } from "../../lib/exportUtils";\nimport { Download } from "lucide-react";\n` + content;
    
    // Fix the Typescript errors: dateOfBirth -> dob or just don't export it
    content = content.replace(/DOB: s\.dateOfBirth,/g, '');
    content = content.replace(/Experience: t\.experience,/g, '');
    
    fs.writeFileSync(file, content);
}

fix('src/pages/admin/AdminStudents.tsx');
fix('src/pages/admin/AdminTeachers.tsx');
