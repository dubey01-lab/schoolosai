const fs = require('fs');

// AppLayout.tsx
let al = fs.readFileSync('src/components/AppLayout.tsx', 'utf-8');
al = al.replace('import { LayoutDashboard,', 'import { LayoutDashboard, Clock, CheckCircle, User,');
fs.writeFileSync('src/components/AppLayout.tsx', al);

// TeacherDashboard.tsx
let td = fs.readFileSync('src/pages/teacher/TeacherDashboard.tsx', 'utf-8');
td = td.replace(
    'setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5));',
    'setNotices(nSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a,b) => b.createdAt?.localeCompare(a.createdAt)).slice(0, 5));'
);
fs.writeFileSync('src/pages/teacher/TeacherDashboard.tsx', td);

// TeacherMarks.tsx
let tm = fs.readFileSync('src/pages/teacher/TeacherMarks.tsx', 'utf-8');
tm = tm.replace(
    'const exData = exSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.status !== "DRAFT");',
    'const exData = exSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(e => e.status !== "DRAFT");'
);
fs.writeFileSync('src/pages/teacher/TeacherMarks.tsx', tm);
