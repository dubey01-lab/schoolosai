import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users, Settings } from "lucide-react";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function SolutionsPage() {
  const solutions = [
    {
      id: "principals",
      icon: LayoutDashboard,
      role: "For Principals",
      title: "Complete oversight and control",
      desc: "Get real-time insights into attendance, fee collections, and staff performance. Make data-driven decisions without chasing reports.",
      benefits: ["Live school-wide dashboard", "Instant financial tracking", "Direct communication with parents", "Automated performance reports"]
    },
    {
      id: "teachers",
      icon: GraduationCap,
      role: "For Teachers",
      title: "Focus on teaching, not paperwork",
      desc: "Mark attendance in seconds, assign homework digitally, and input marks directly into the system. Reclaim hours of administrative time every week.",
      benefits: ["1-click digital attendance", "Easy homework assignment", "Streamlined exam grading", "Direct access to student histories"]
    },
    {
      id: "parents",
      role: "For Parents",
      icon: Users,
      title: "Stay connected to your child's progress",
      desc: "Receive instant updates on attendance, view pending fee invoices, check homework assignments, and access digital report cards anytime, anywhere.",
      benefits: ["Real-time attendance alerts", "Digital fee receipts", "Centralized notice board", "Instant exam result access"]
    },
    {
      id: "administrators",
      role: "For Administrators",
      icon: Settings,
      title: "Streamline daily school operations",
      desc: "Manage the entire student lifecycle from admission enquiry to alumni. Organize classes, sections, and fee structures with ease.",
      benefits: ["Centralized admission CRM", "Automated fee structure assignment", "Secure role-based access", "Comprehensive student directories"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <PublicNavbar />
      
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Solutions for every <span className="text-indigo-600">stakeholder.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          SchoolOS AI is designed to make life easier for everyone involved in your school's success.
        </p>
      </section>

      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto space-y-24">
        {solutions.map((sol, index) => (
          <div key={sol.id} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
                <sol.icon className="w-5 h-5" />
                {sol.role}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">{sol.title}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {sol.desc}
              </p>
              <ul className="space-y-3 pt-4">
                {sol.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex items-center justify-center relative z-10 p-8">
                <sol.icon className="w-32 h-32 text-slate-200" />
              </div>
              <div className="absolute -inset-4 bg-indigo-50 rounded-3xl -z-10 transform rotate-3"></div>
            </div>
          </div>
        ))}
      </section>

      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Empower your entire school community</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/book-demo" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
            Book a Demo
          </Link>
          <Link to="/features" className="bg-white text-slate-700 border border-slate-200 font-semibold px-8 py-4 rounded-full hover:bg-slate-50 transition-colors">
            Explore Features
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
