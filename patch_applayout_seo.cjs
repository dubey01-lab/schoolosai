const fs = require('fs');
let content = fs.readFileSync('src/components/AppLayout.tsx', 'utf-8');

if (!content.includes('import { SEO }')) {
  content = content.replace(/(import React.*?;\n)/, `$1import { SEO } from "./SEO";\n`);
  
  const seoBlock = `<SEO title="SchoolOS AI Dashboard" description="SchoolOS AI Dashboard" noindex={true} />`;
  content = content.replace(/(<div className="min-h-screen bg-slate-50 flex">)/, `$1\n      ${seoBlock}`);
  
  fs.writeFileSync('src/components/AppLayout.tsx', content);
}
