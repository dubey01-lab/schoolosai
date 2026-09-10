import React from "react";
import { SEO } from "../../components/SEO";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <SEO 
        title="School Management Software Pricing | SchoolOS AI" 
        description="View pricing for SchoolOS AI school management software. Choose the plan that fits your modern school." 
        canonicalUrl="/pricing" 
        noindex={false}
      />
      
      <PublicNavbar />
      
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Simple, transparent <span className="text-indigo-600">pricing.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the perfect plan for your school's size and needs. No hidden fees.
        </p>
      </section>

      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-slate-900">Starter</h3>
            <p className="text-slate-500 text-sm mt-2">For small schools</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900">₹4,999</span>
              <span className="text-slate-500">/year</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Student Management', 'Basic Attendance', 'Fee Management', 'Homework', 'Notices', 'Parent Access', 'Basic Results'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/book-demo" className="mt-8 block w-full py-3 rounded-full border border-indigo-200 text-indigo-600 font-medium text-center hover:bg-indigo-50 transition-colors">Contact Sales</Link>
          </div>
          
          {/* Professional */}
          <div className="bg-indigo-600 rounded-3xl p-8 border border-indigo-600 shadow-xl relative scale-105 z-10 text-white transform transition-transform hover:scale-110">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</span>
            </div>
            <h3 className="text-xl font-semibold">Professional</h3>
            <p className="text-indigo-200 text-sm mt-2">For growing schools</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight">₹9,999</span>
              <span className="text-indigo-200">/year</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Everything in Starter', 'Teacher Management', 'Exams & Results', 'Admissions CRM', 'Advanced Reports', 'AI Notice Generator', 'Multi-user Management'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/book-demo" className="mt-8 block w-full py-3 rounded-full bg-white text-indigo-600 font-medium text-center hover:bg-indigo-50 transition-colors shadow-sm">Book Demo</Link>
          </div>

          {/* Premium / Enterprise */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <h3 className="text-xl font-semibold text-slate-900">Enterprise</h3>
            <p className="text-slate-500 text-sm mt-2">For schools with custom needs</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">Talk to us</span>
            </div>
            <p className="mt-8 text-sm text-slate-600 flex-1">
              Need custom integrations, dedicated onboarding, or a platform-wide rollout for multiple school branches? Contact our team to build a plan that fits your exact requirements.
            </p>
            <Link to="/contact" className="mt-8 block w-full py-3 rounded-full border border-indigo-200 text-indigo-600 font-medium text-center hover:bg-indigo-50 transition-colors">Contact Sales</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
