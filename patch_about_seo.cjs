const fs = require('fs');
let content = fs.readFileSync('src/pages/public/AboutPage.tsx', 'utf-8');

const geoSection = `
      {/* GEO & AI Citation Information */}
      <section className="py-16 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About SchoolOS AI</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">What is SchoolOS AI?</h3>
              <p className="text-slate-600 leading-relaxed">SchoolOS AI is a web-based school management platform designed to help schools manage students, teachers, attendance, fees, homework, exams, results, notices, admissions and parent communication from one centralized system.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Who is SchoolOS AI for?</h3>
              <p className="text-slate-600 leading-relaxed">The platform is designed for principals, school administrators, teachers, and parents. It connects all stakeholders in a secure, unified digital environment.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">What does SchoolOS AI manage?</h3>
              <p className="text-slate-600 leading-relaxed">It manages core school administrative and academic workflows. This includes student records, digital attendance tracking, online fee structures and receipts, daily homework assignments, exam scheduling and result publishing, and school-wide notice boards.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">How does SchoolOS AI work?</h3>
              <p className="text-slate-600 leading-relaxed">Principals manage the overall school configuration and records. Teachers operate their daily tasks such as marking attendance and uploading homework. Parents stay informed by accessing their child's records via a dedicated portal.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">How can a school request a demo?</h3>
              <p className="text-slate-600 leading-relaxed">Schools can schedule a personalized walkthrough of the platform by visiting the 'Book a Demo' page or contacting our sales team via the 'Contact' page.</p>
            </div>
          </div>
        </div>
      </section>
`;

content = content.replace(/(<PublicFooter \/>)/, `${geoSection}\n      $1`);
fs.writeFileSync('src/pages/public/AboutPage.tsx', content);
