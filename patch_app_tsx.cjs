const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('AdminClasses')) {
  content = content.replace('import AdminReports from "./pages/admin/AdminReports";', 'import AdminReports from "./pages/admin/AdminReports";\nimport AdminClasses from "./pages/admin/AdminClasses";');
  content = content.replace('<Route path="reports" element={<AdminReports />} />', '<Route path="reports" element={<AdminReports />} />\n              <Route path="classes" element={<AdminClasses />} />');
  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx updated');
} else {
  console.log('Already updated');
}
