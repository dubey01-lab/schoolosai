const fs = require('fs');
let content = fs.readFileSync('src/pages/superadmin/SuperAdminLogin.tsx', 'utf-8');

content = content.replace(
  /<h1 className="text-3xl font-bold text-white tracking-tight">Super Admin Login<\/h1>/,
  `<h1 className="text-3xl font-bold text-white tracking-tight">SchoolOS AI — Super Admin Portal</h1>`
);
content = content.replace(
  /\{loading \? <Loader2 className="w-5 h-5 animate-spin" \/> : "Access Platform"\}/,
  `{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}`
);

fs.writeFileSync('src/pages/superadmin/SuperAdminLogin.tsx', content);
