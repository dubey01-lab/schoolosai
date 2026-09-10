const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFeeReports.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = 'import { downloadCSV } from "../../lib/exportUtils";\n' + code;
}

fs.writeFileSync('src/pages/admin/AdminFeeReports.tsx', code);
