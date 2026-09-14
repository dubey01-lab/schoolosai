import React from "react";
import { SEO } from "./SEO";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  CreditCard, 
  BookOpen, 
  FileText, 
  Bell, 
  UserPlus, 
  MessageSquare, 
  Sparkles, 
  BarChart, 
  Settings, 
  LogOut,
  Menu,
  X
, Clock, CheckCircle, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Students", icon: Users, href: "/admin/students" },
  { name: "Teachers", icon: GraduationCap, href: "/admin/teachers" },
  { name: "Classes", icon: FileText, href: "/admin/classes" },
  { name: "Attendance", icon: CalendarCheck, href: "/admin/attendance" },
  { name: "Fees", icon: CreditCard, href: "/admin/fees" },
  { name: "Homework", icon: BookOpen, href: "/admin/homework" },
  { name: "Exams & Results", icon: FileText, href: "/admin/exams" },
  { name: "Notices", icon: Bell, href: "/admin/notices" },
  { name: "Admissions", icon: UserPlus, href: "/admin/admissions" },
  { name: "Support", icon: MessageSquare, href: "/admin/support" },
  { name: "AI Assistant", icon: Sparkles, href: "/admin/ai" },
  { name: "Reports", icon: BarChart, href: "/admin/reports" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

const teacherLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
  { name: "My Classes", icon: Users, href: "/teacher/classes" },
  { name: "Attendance", icon: CalendarCheck, href: "/teacher/attendance" },
  { name: "Homework", icon: BookOpen, href: "/teacher/homework" },
  { name: "Exams & Marks", icon: FileText, href: "/teacher/marks" },
  { name: "Notices", icon: Bell, href: "/teacher/notices" },
  { name: "Timetable", icon: Clock, href: "/teacher/timetable" },
  { name: "Class Progress", icon: CheckCircle, href: "/teacher/progress" },
  { name: "Profile", icon: User, href: "/teacher/profile" },
];

const parentLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/parent/dashboard" },
  { name: "Attendance", icon: CalendarCheck, href: "/parent/attendance" },
  { name: "Fees", icon: CreditCard, href: "/parent/fees" },
  { name: "Homework", icon: BookOpen, href: "/parent/homework" },
  { name: "Notices", icon: Bell, href: "/parent/notices" },
  { name: "Results", icon: FileText, href: "/parent/results" },
];

const superAdminLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/superadmin/dashboard" },
  { name: "Enquiries", icon: MessageSquare, href: "/superadmin/enquiries" },
  { name: "Support Tickets", icon: FileText, href: "/superadmin/support" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { userData, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const links = userData?.role === "SUPER_ADMIN"
    ? superAdminLinks
    : userData?.role === "ADMIN" 
      ? adminLinks 
      : userData?.role === "TEACHER" 
        ? teacherLinks 
        : userData?.role === "PARENT"
          ? parentLinks
          : [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SEO title="SchoolOS AI Dashboard" description="SchoolOS AI Dashboard" noindex={true} />
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 80 : 256,
          x: mobileOpen ? 0 : (window.innerWidth < 1024 ? -256 : 0)
        }}
        className={cn(
          "fixed lg:sticky top-0 h-screen bg-indigo-950 text-slate-300 flex flex-col z-50 transition-all duration-300 border-r border-indigo-900",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-indigo-900/50 justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-white text-lg tracking-tight">SchoolOS<span className="text-indigo-400">AI</span></span>}
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-transparent">
          <nav className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-indigo-600/20 text-indigo-300 font-medium" 
                      : "hover:bg-indigo-900/50 hover:text-white"
                  )}
                  title={collapsed ? link.name : undefined}
                >
                  <link.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300")} />
                  {!collapsed && <span>{link.name}</span>}
                  {isActive && !collapsed && (
                    <motion.div layoutId="active-nav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-indigo-900/50 shrink-0">
          <div className={cn("flex items-center gap-3 mb-4", collapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center shrink-0 text-white font-medium">
              {userData?.name?.charAt(0) || "U"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-white truncate">{userData?.name}</div>
                <div className="text-xs text-indigo-300 truncate">{userData?.role}</div>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-indigo-900/50 hover:text-white transition-colors",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">
              {links.find(l => location.pathname.startsWith(l.href))?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to={userData?.role === "ADMIN" ? "/admin/settings/notifications" : "#"} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative" title="Notification Settings">
              <Settings className="w-5 h-5" />
            </Link>
            <Link to={userData?.role === "ADMIN" ? "/admin/notifications" : "#"} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
