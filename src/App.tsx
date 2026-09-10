import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import SolutionsPage from "./pages/public/SolutionsPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import AboutPage from "./pages/public/AboutPage";
import PricingPage from "./pages/public/PricingPage";
import ContactPage from "./pages/public/ContactPage";
import BookDemoPage from "./pages/public/BookDemoPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import { AppLayout } from "./components/AppLayout";
import { Toaster } from "react-hot-toast";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetails from "./pages/admin/AdminStudentDetails";
import AdminAI from "./pages/admin/AdminAI";
import AdminExams from "./pages/admin/AdminExams";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminNoticeCreate from "./pages/admin/AdminNoticeCreate";
import AdminNoticeDetails from "./pages/admin/AdminNoticeDetails";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettingsNotifications from "./pages/admin/AdminSettingsNotifications";
import AdminNoticesAnalytics from "./pages/admin/AdminNoticesAnalytics";
import ParentNotices from "./pages/parent/ParentNotices";
import TeacherNotices from "./pages/teacher/TeacherNotices";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherClassDetails from "./pages/teacher/TeacherClassDetails";
import AdminFees from "./pages/admin/AdminFees";
import AdminFeeStructure from "./pages/admin/AdminFeeStructure";
import AdminFeeCollect from "./pages/admin/AdminFeeCollect";
import AdminFeeTransactions from "./pages/admin/AdminFeeTransactions";
import AdminFeePending from "./pages/admin/AdminFeePending";
import AdminFeeReports from "./pages/admin/AdminFeeReports";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentFees from "./pages/parent/ParentFees";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentHomework from "./pages/parent/ParentHomework";
import ParentResults from "./pages/parent/ParentResults";
import AdminAdmissions from "./pages/admin/AdminAdmissions";
import AdminReports from "./pages/admin/AdminReports";
import AdminClasses from "./pages/admin/AdminClasses";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminSchoolManage from "./pages/superadmin/SuperAdminSchoolManage";
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import AdminSupport from "./pages/admin/AdminSupport";
import SuperAdminEnquiries from "./pages/superadmin/SuperAdminEnquiries";
import SuperAdminSupport from "./pages/superadmin/SuperAdminSupport";


function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!user) {
    if (window.location.pathname.startsWith('/superadmin') && window.location.pathname !== '/superadmin/login') {
      return <Navigate to="/superadmin/login" />;
    }
    return <Navigate to="/login" />;
  }
  if (userData && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/solutions" element={<SolutionsPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/book-demo" element={<BookDemoPage />} />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
            
      {/* Super Admin Routes */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/*" element={
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="schools/:schoolId" element={<SuperAdminSchoolManage />} />
              <Route path="enquiries" element={<SuperAdminEnquiries />} />
              <Route path="support" element={<SuperAdminSupport />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Page Not Found</div>} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentDetails />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="admissions" element={<AdminAdmissions />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="ai" element={<AdminAI />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="fees/structure" element={<AdminFeeStructure />} />
              <Route path="fees/collect" element={<AdminFeeCollect />} />
              <Route path="fees/transactions" element={<AdminFeeTransactions />} />
              <Route path="fees/pending" element={<AdminFeePending />} />
              <Route path="fees/reports" element={<AdminFeeReports />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="notices/create" element={<AdminNoticeCreate />} />
              <Route path="notices/:id" element={<AdminNoticeDetails />} />
              <Route path="notices/analytics" element={<AdminNoticesAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings/notifications" element={<AdminSettingsNotifications />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Page Not Found</div>} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Teacher Routes */}
      <Route path="/teacher/*" element={
        <ProtectedRoute allowedRoles={["TEACHER"]}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="classes/:classId" element={<TeacherClassDetails />} />
              <Route path="notices" element={<TeacherNotices />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Page Not Found</div>} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Parent Routes */}
      <Route path="/parent/*" element={
        <ProtectedRoute allowedRoles={["PARENT"]}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="attendance" element={<ParentAttendance />} />
              <Route path="homework" element={<ParentHomework />} />
              <Route path="results" element={<ParentResults />} />
              <Route path="notices" element={<ParentNotices />} />
              <Route path="fees" element={<ParentFees />} />
              <Route path="*" element={<div className="p-8 text-center text-slate-500">Page Not Found</div>} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function GlobalShortcuts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        navigate('/superadmin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <GlobalShortcuts />
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
