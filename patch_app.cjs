const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import
content = content.replace('import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";', 'import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";\nimport SuperAdminSchoolManage from "./pages/superadmin/SuperAdminSchoolManage";');

// Insert route
content = content.replace('<Route path="dashboard" element={<SuperAdminDashboard />} />', '<Route path="dashboard" element={<SuperAdminDashboard />} />\n              <Route path="schools/:schoolId" element={<SuperAdminSchoolManage />} />');

fs.writeFileSync('src/App.tsx', content);
console.log('App patched');
