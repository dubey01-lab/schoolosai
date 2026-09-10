const fs = require('fs');
let content = fs.readFileSync('src/pages/public/LandingPage.tsx', 'utf-8');

if (!content.includes('import { SEO }')) {
  content = content.replace(/(import React.*?;\n)/, `$1import { SEO } from "../../components/SEO";\n`);
  
  const seoBlock = `<SEO 
      title="SchoolOS AI — School Management Software for Modern Schools" 
      description="SchoolOS AI is a modern school management platform for principals, teachers and parents. Manage students, attendance, fees, homework, exams, results, notices and parent communication in one place." 
      canonicalUrl="/" 
      schema={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SchoolOS AI",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "url": "https://schoolosai.vercel.app/",
        "description": "SchoolOS AI helps schools manage students, attendance, fees, homework, exams, results, notices, admissions and parent communication from one centralized platform."
      }}
    />
    `;
  
  content = content.replace(/(<div className="min-h-screen[^>]*>)/, `$1\n      ${seoBlock}`);
  
  // Add FAQ Content before the footer
  const faqSection = `
      {/* FAQ / AEO Content */}
      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto bg-white border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-slate-600">Everything you need to know about the SchoolOS AI school management software.</p>
        </div>
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">What is SchoolOS AI?</h3>
            <p className="text-slate-600 leading-relaxed">SchoolOS AI is a centralized digital system that helps schools manage administrative and academic workflows such as students, attendance, fees, homework, exams, results and parent communication. It is a comprehensive school management software designed for modern educational institutions.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Who can use SchoolOS AI?</h3>
            <p className="text-slate-600 leading-relaxed">SchoolOS AI is built for principals, school administrators, teachers, and parents. Principals can manage school-wide operations, teachers can operate their daily classroom tasks like attendance and homework, and parents can stay informed about their child's progress.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Can teachers take attendance online?</h3>
            <p className="text-slate-600 leading-relaxed">Yes. Teachers can manage student attendance digitally through the SchoolOS AI teacher portal. Parents are automatically able to view their child's attendance records in real-time through the parent portal.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Can schools manage fees and receipts?</h3>
            <p className="text-slate-600 leading-relaxed">Yes. SchoolOS AI includes robust school fee management software. Administrators can create fee structures, collect payments, issue digital fee receipts, and track pending balances easily.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Does SchoolOS AI support multiple schools?</h3>
            <p className="text-slate-600 leading-relaxed">Yes. The platform's architecture allows for multi-tenant school administration software deployments, ensuring each school's data is securely isolated.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">How does SchoolOS AI protect school data?</h3>
            <p className="text-slate-600 leading-relaxed">SchoolOS AI relies on secure, industry-standard infrastructure with strict role-based access control (RBAC). A teacher can only access their assigned classes, and a parent can only view their own child's information.</p>
          </div>
        </div>
      </section>
  `;
  
  content = content.replace(/(<PublicFooter \/>)/, `${faqSection}\n      $1`);
  
  fs.writeFileSync('src/pages/public/LandingPage.tsx', content);
}
