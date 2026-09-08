const fs = require('fs');

let tContent = fs.readFileSync('src/pages/admin/AdminTeachers.tsx', 'utf8');
tContent = tContent.replace('toast.success("Teacher account created. (Default password: password123)");', 'toast.success("Teacher account created. Activation email sent.");');
fs.writeFileSync('src/pages/admin/AdminTeachers.tsx', tContent);

let sContent = fs.readFileSync('src/pages/superadmin/SuperAdminDashboard.tsx', 'utf8');
sContent = sContent.replace('toast.success("School and Principal account created successfully. (Default password: password123)");', 'toast.success("School and Principal account created successfully. Activation email sent.");');
fs.writeFileSync('src/pages/superadmin/SuperAdminDashboard.tsx', sContent);

console.log('Toasts patched');
