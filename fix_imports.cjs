const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminReports.tsx', 'utf-8');

if (!content.includes('downloadCSV')) {
    console.log("No downloadCSV found!");
}

content = `import { Download } from "lucide-react";\nimport { downloadCSV } from "../../lib/exportUtils";\n` + content;
fs.writeFileSync('src/pages/admin/AdminReports.tsx', content);
