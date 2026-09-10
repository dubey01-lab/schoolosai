const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
const imports = `
import AdminSupport from "./pages/admin/AdminSupport";
import SuperAdminEnquiries from "./pages/superadmin/SuperAdminEnquiries";
import SuperAdminSupport from "./pages/superadmin/SuperAdminSupport";
`;

app = app.replace('import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";', 'import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";' + imports);

// SuperAdmin routes
app = app.replace('<Route path="schools/:schoolId" element={<SuperAdminSchoolManage />} />', '<Route path="schools/:schoolId" element={<SuperAdminSchoolManage />} />\n              <Route path="enquiries" element={<SuperAdminEnquiries />} />\n              <Route path="support" element={<SuperAdminSupport />} />');

// Admin routes
app = app.replace('<Route path="admissions" element={<AdminAdmissions />} />', '<Route path="admissions" element={<AdminAdmissions />} />\n              <Route path="support" element={<AdminSupport />} />');

fs.writeFileSync('src/App.tsx', app);
console.log('Routes patched.');
