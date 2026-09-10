const fs = require('fs');

const pages = [
  {
    file: 'AboutPage.tsx',
    title: 'About SchoolOS AI | Modern School Management Platform',
    desc: 'SchoolOS AI is a web-based school management platform designed to help schools manage students, teachers, attendance, fees, homework, exams, results, notices, admissions and parent communication from one centralized system.',
    url: '/about'
  },
  {
    file: 'BookDemoPage.tsx',
    title: 'Book a School Management Software Demo | SchoolOS AI',
    desc: 'Book a demo with SchoolOS AI to see how our modern school management platform can streamline your administrative workflows, fee management, and parent communication.',
    url: '/book-demo'
  },
  {
    file: 'ContactPage.tsx',
    title: 'Contact SchoolOS AI | School Management Software',
    desc: 'Get in touch with SchoolOS AI for support, sales, or partnership inquiries regarding our modern school management software.',
    url: '/contact'
  },
  {
    file: 'FeaturesPage.tsx',
    title: 'School Management Software Features | SchoolOS AI',
    desc: 'Explore SchoolOS AI features including student management, teacher management, attendance tracking, fee receipts, homework management, exams, results, notices, and parent portals.',
    url: '/features'
  },
  {
    file: 'HowItWorksPage.tsx',
    title: 'How SchoolOS AI Works | School Management Platform',
    desc: 'Learn how SchoolOS AI works to centralize your school administration workflows. Principals manage, teachers operate, and parents stay informed.',
    url: '/how-it-works'
  },
  {
    file: 'PricingPage.tsx',
    title: 'School Management Software Pricing | SchoolOS AI',
    desc: 'View pricing for SchoolOS AI school management software. Choose the plan that fits your modern school.',
    url: '/pricing'
  },
  {
    file: 'SolutionsPage.tsx',
    title: 'School Management Solutions for Schools | SchoolOS AI',
    desc: 'SchoolOS AI provides dedicated solutions for principals, teachers, and parents to stay connected and efficiently manage school workflows.',
    url: '/solutions'
  },
  {
    file: 'LoginPage.tsx',
    title: 'SchoolOS AI Login | Principal, Teacher & Parent',
    desc: 'Securely log in to your SchoolOS AI school management portal as a Principal, Admin, Teacher, or Parent.',
    url: '/login'
  }
];

pages.forEach(page => {
  const filePath = `src/pages/public/${page.file}`;
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('import { SEO }')) {
    content = content.replace(/(import React.*?;\n)/, `$1import { SEO } from "../../components/SEO";\n`);
    
    // Most public pages have <div className="min-h-screen..."> or <div className="...
    // We'll replace the first '<div className="min-h-screen' with the SEO block + that div
    const seoBlock = `<SEO 
        title="${page.title}" 
        description="${page.desc}" 
        canonicalUrl="${page.url}" 
        noindex={${page.file === 'LoginPage.tsx' ? 'true' : 'false'}}
      />
      `;
    
    content = content.replace(/(<div className="min-h-screen[^>]*>)/, `$1\n      ${seoBlock}`);
    
    fs.writeFileSync(filePath, content);
  }
});
