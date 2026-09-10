const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');

code = code.replace('FeeType: f.feeId,', 'FeeType: f.id,');

fs.writeFileSync('src/pages/admin/AdminFees.tsx', code);
