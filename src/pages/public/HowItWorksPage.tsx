import React from "react";
import { SEO } from "../../components/SEO";
import { Link } from "react-router-dom";
import { Building2, Settings, Users, ArrowDown, GraduationCap, CheckCircle2 } from "lucide-react";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: Building2,
      title: "Create your school",
      desc: "Sign up and set up your school's basic profile. Our secure cloud infrastructure isolates your data instantly."
    },
    {
      num: "02",
      icon: Settings,
      title: "Configure academics",
      desc: "Define your academic year, set up classes, sections, and subjects. Create customized fee structures."
    },
    {
      num: "03",
      icon: Users,
      title: "Add teachers and students",
      desc: "Import or manually add your students and staff. Assign teachers to their respective classes and subjects."
    },
    {
      num: "04",
      icon: GraduationCap,
      title: "Run daily operations",
      desc: "Teachers log in to mark attendance, assign homework, and enter marks. Principals get an instant overview."
    },
    {
      num: "05",
      icon: CheckCircle2,
      title: "Keep parents informed",
      desc: "Parents use their secure portal to view live updates on their child's progress, fees, and school notices."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <SEO 
        title="How SchoolOS AI Works | School Management Platform" 
        description="Learn how SchoolOS AI works to centralize your school administration workflows. Principals manage, teachers operate, and parents stay informed." 
        canonicalUrl="/how-it-works" 
        noindex={false}
      />
      
      <PublicNavbar />
      
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          From setup to success in <span className="text-indigo-600">record time.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          We built SchoolOS AI to be incredibly intuitive. Your entire school can be up and running in a matter of days, not months.
        </p>
      </section>

      <section className="py-16 px-6 lg:px-12 max-w-3xl mx-auto relative">
        <div className="absolute left-[39px] top-24 bottom-24 w-0.5 bg-indigo-100 hidden md:block"></div>
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-8 relative">
              <div className="hidden md:flex flex-col items-center shrink-0 w-20">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center shadow-sm z-10">
                  <step.icon className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-indigo-600 font-bold font-mono text-xl">{step.num}</span>
                  <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center mt-12">
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Ready to get started?</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Experience the simplicity of modern school management. Book a demo today to see exactly how it works for your school.
          </p>
          <Link to="/book-demo" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors shadow-sm inline-block">
            Book a Demo
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
