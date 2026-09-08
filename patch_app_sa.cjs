const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('import SuperAdminSchoolManage from "./pages/superadmin/SuperAdminSchoolManage";', 'import SuperAdminSchoolManage from "./pages/superadmin/SuperAdminSchoolManage";\nimport SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";');

content = content.replace('<Route path="/superadmin/*" element={', '<Route path="/superadmin/login" element={<SuperAdminLogin />} />\n      <Route path="/superadmin/*" element={');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched');
