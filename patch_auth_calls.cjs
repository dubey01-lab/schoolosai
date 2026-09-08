const fs = require('fs');

function patchFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/createAccountSecurely\(([^,]+),\s*"password123",\s*\{/g, 'createAccountSecurely($1, {');
  fs.writeFileSync(path, content);
  console.log('Patched ' + path);
}

patchFile('src/pages/admin/AdminTeachers.tsx');
patchFile('src/pages/superadmin/SuperAdminDashboard.tsx');
patchFile('src/pages/admin/AdminAttendance.tsx'); // Fix the ...d.data() error too
