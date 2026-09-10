import React from "react";
import { SEO } from "../../components/SEO";
import { Link } from "react-router-dom";
import { ArrowRight, Users, GraduationCap, CalendarCheck, CreditCard, BookOpen, FileText, Bell, UserPlus, BarChart3, LayoutDashboard } from "lucide-react";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function FeaturesPage() {
  const features = [
    { id: "students", icon: Users, title: "Student Management", desc: "Maintain complete digital records of all students. Organize by classes and sections. Manage profiles effortlessly." },
    { id: "teachers", icon: GraduationCap, title: "Teacher Management", desc: "Keep track of staff details, assign them to classes and subjects, and provide them with secure individual login access." },
    { id: "attendance", icon: CalendarCheck, title: "Attendance", desc: "Teachers can mark daily attendance directly from their portal. Principals and parents receive instant updates." },
    { id: "fees", icon: CreditCard, title: "Fees & Receipts", desc: "Structure your fee plans, assign them to students, record offline payments, and generate digital receipts." },
    { id: "homework", icon: BookOpen, title: "Homework", desc: "Teachers can assign classwork or homework digitally. Parents can review assignments directly in the Parent Portal." },
    { id: "exams", icon: FileText, title: "Exams & Results", desc: "Configure exams, input marks effortlessly, and generate digital result report cards for parents." },
    { id: "notices", icon: Bell, title: "Notices & Communication", desc: "Publish digital notices to all parents, all teachers, or specific sections to keep everyone in the loop." },
    { id: "admissions", icon: UserPlus, title: "Admissions CRM", desc: "Track prospective student enquiries from new contact all the way through to successful admission." },
    { id: "reports", icon: BarChart3, title: "Automated Reports", desc: "Generate insightful reports for attendance, fee collections, student performance, and admissions pipeline." },
    { id: "parent-portal", icon: Users, title: "Parent Portal", desc: "A dedicated secure login where parents can exclusively view their child's attendance, fees, homework, and results." },
    { id: "teacher-portal", icon: GraduationCap, title: "Teacher Portal", desc: "A streamlined interface for teachers to manage their assigned classes, attendance, and exam grading." },
    { id: "principal", icon: LayoutDashboard, title: "Principal Dashboard", desc: "A bird's-eye view of everything happening in the school. Monitor key metrics, collections, and overall health in real-time." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 flex flex-col">
      <SEO 
        title="School Management Software Features | SchoolOS AI" 
        description="Explore SchoolOS AI features including student management, teacher management, attendance tracking, fee receipts, homework management, exams, results, notices, and parent portals." 
        canonicalUrl="/features" 
        noindex={false}
      />
      
      <PublicNavbar />
      
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Everything your school needs. <br className="hidden md:block"/> <span className="text-indigo-600">In one platform.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Explore the tools designed specifically to reduce administrative overhead and improve communication.
        </p>
      </section>

      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-indigo-600 rounded-3xl p-12 shadow-xl text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to see it in action?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Book a personalized demonstration with our team to see how SchoolOS AI can transform your institution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book-demo" className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full hover:bg-slate-50 transition-colors">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
