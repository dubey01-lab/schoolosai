import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, Users, BookOpen, CalendarCheck, CreditCard, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <PublicNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center relative flex-1">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Run your entire school from one <span className="text-indigo-600">simple platform.</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage students, attendance, fees, homework, results, notices and parent communication — all in one modern, AI-powered school management system.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book-demo" className="bg-indigo-600 text-white text-lg font-medium px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto flex items-center justify-center gap-2 group">
              Book a Demo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/features" className="bg-white text-slate-700 border border-slate-200 text-lg font-medium px-8 py-4 rounded-full hover:bg-slate-50 transition-colors w-full sm:w-auto flex items-center justify-center">
              View Features
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trust Strip */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-slate-500 font-medium text-sm">
          <p className="text-slate-900 font-semibold text-center md:text-left">Built for modern schools</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500"/> Simple workflows</div>
            <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500"/> Secure school data</div>
            <div className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500"/> Parent & Teacher friendly</div>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-slate-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Everything you need</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">A complete suite of tools designed to make school management effortless and efficient.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: "Student Management", desc: "Keep track of student records, admissions, and history securely." },
            { icon: CalendarCheck, title: "Attendance Tracking", desc: "Lightning-fast daily attendance marking by teachers." },
            { icon: CreditCard, title: "Fee Management", desc: "Create fee structures, track payments, and generate receipts." },
            { icon: BookOpen, title: "Academics & Homework", desc: "Assign homework and manage class materials effortlessly." },
            { icon: FileText, title: "Exams & Results", desc: "Record marks and generate beautiful report cards automatically." },
            { icon: Shield, title: "Role-Based Access", desc: "Dedicated secure portals for Principals, Teachers, and Parents." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/features" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
            See all features <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
}
