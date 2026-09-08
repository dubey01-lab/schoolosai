const fs = require('fs');

let content = fs.readFileSync('src/components/AppLayout.tsx', 'utf8');

if (!content.includes('href: "/admin/classes"')) {
  content = content.replace('{ name: "Teachers", icon: Users, href: "/admin/teachers" },', '{ name: "Teachers", icon: Users, href: "/admin/teachers" },\n  { name: "Classes", icon: FileText, href: "/admin/classes" },');
  fs.writeFileSync('src/components/AppLayout.tsx', content);
  console.log('AppLayout updated');
} else {
  console.log('Already updated');
}
