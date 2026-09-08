const fs = require('fs');

let content = fs.readFileSync('src/pages/superadmin/SuperAdminDashboard.tsx', 'utf8');
content = content.replace('<button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Manage</button>', '<Link to={`/superadmin/schools/${school.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Manage</Link>');
fs.writeFileSync('src/pages/superadmin/SuperAdminDashboard.tsx', content);
console.log('SuperAdminDashboard patched');
