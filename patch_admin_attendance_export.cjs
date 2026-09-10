const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf8');

code = code.replace(/\`attendance_\$\{selectedClass\}_\$\{selectedSection\}_\$\{date\}.csv\`/g, '\`attendance_${selectedClass}_${date}.csv\`');

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
