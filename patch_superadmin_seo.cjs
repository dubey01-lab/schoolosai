const fs = require('fs');
let content = fs.readFileSync('src/pages/superadmin/SuperAdminLogin.tsx', 'utf-8');

if (!content.includes('import { SEO }')) {
  content = content.replace(/(import React.*?;\n)/, `$1import { SEO } from "../../components/SEO";\n`);
  
  const seoBlock = `<SEO 
      title="SchoolOS AI — Super Admin Portal" 
      description="Private platform administration" 
      noindex={true}
    />
    `;
  
  content = content.replace(/(<div className="min-h-screen[^>]*>)/, `$1\n      ${seoBlock}`);
  fs.writeFileSync('src/pages/superadmin/SuperAdminLogin.tsx', content);
}
