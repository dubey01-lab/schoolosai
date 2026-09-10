const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFeeReports.tsx', 'utf8');

if (!code.includes('import toast')) {
  code = 'import toast from "react-hot-toast";\n' + code;
}
// Clean up a previous botched patch if it exists
code = code.replace('import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";\nimport toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";\n', 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";\n');

fs.writeFileSync('src/pages/admin/AdminFeeReports.tsx', code);
