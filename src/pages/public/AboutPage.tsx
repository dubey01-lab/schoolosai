import React from "react";
import { SEO } from "../../components/SEO";
import { Shield, Sparkles, Heart } from "lucide-react";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <SEO 
        title="About SchoolOS AI | Modern School Management Platform" 
        description="SchoolOS AI is a web-based school management platform designed to help schools manage students, teachers, attendance, fees, homework, exams, results, notices, admissions and parent communication from one centralized system." 
        canonicalUrl="/about" 
        noindex={false}
      />
      
      <PublicNavbar />
      
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Redefining <span className="text-indigo-600">School Management</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          SchoolOS AI was built with a simple mission: to eliminate the administrative burden on educators and administrators, allowing them to focus on what truly matters — shaping the future of students.
        </p>
      </section>

      <section className="py-12 px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed text-lg mb-6">
            We believe that technology should work for educators, not the other way around. Most school management systems are clunky, outdated, and require endless training. We designed SchoolOS AI from the ground up to be intuitive, fast, and beautiful.
          </p>
          <p className="text-slate-600 leading-relaxed text-lg">
            By combining modern design with powerful automation, we provide a unified platform that connects principals, teachers, and parents in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Security First</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We employ strict tenant isolation, role-based access control, and encrypted data storage to ensure your school's data remains entirely private and secure.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Design</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A clean, distraction-free interface means less time clicking through menus and more time getting things done. No manual required.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Built for People</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Whether you are a principal managing thousands of students, or a parent checking on a single assignment, the platform adapts to your specific needs.
            </p>
          </div>
        </div>
      </section>

      
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

      <PublicFooter />
    </div>
  );
}
