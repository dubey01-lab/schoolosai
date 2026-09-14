const fs = require('fs');

let content = fs.readFileSync('src/components/AppLayout.tsx', 'utf-8');

if (!content.includes('href: "/teacher/marks"')) {
    content = content.replace(
        'const teacherLinks = [\n  { name: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },\n  { name: "My Classes", icon: Users, href: "/teacher/classes" },\n  { name: "Attendance", icon: CalendarCheck, href: "/teacher/attendance" },\n  { name: "Homework", icon: BookOpen, href: "/teacher/homework" },\n];',
        `const teacherLinks = [\n  { name: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },\n  { name: "My Classes", icon: Users, href: "/teacher/classes" },\n  { name: "Attendance", icon: CalendarCheck, href: "/teacher/attendance" },\n  { name: "Homework", icon: BookOpen, href: "/teacher/homework" },\n  { name: "Exams & Marks", icon: FileText, href: "/teacher/marks" },\n  { name: "Notices", icon: Bell, href: "/teacher/notices" },\n  { name: "Timetable", icon: Clock, href: "/teacher/timetable" },\n  { name: "Class Progress", icon: CheckCircle, href: "/teacher/progress" },\n  { name: "Profile", icon: User, href: "/teacher/profile" },\n];`
    );
    // Add missing imports
    if (!content.includes('Clock,')) {
        content = content.replace('import { LayoutDashboard,', 'import { LayoutDashboard, Clock, CheckCircle, User,');
    }
    fs.writeFileSync('src/components/AppLayout.tsx', content);
}
