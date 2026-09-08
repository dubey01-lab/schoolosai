const fs = require('fs');
let pContent = fs.readFileSync('src/pages/parent/ParentNotices.tsx', 'utf8');
pContent = pContent.replace(/publishedAt/g, 'publishDate');
pContent = pContent.replace(/n.audience.includes\("PARENTS"\) || n.audience.includes\("ALL"\)/g, 'n.audience === "ALL_PARENTS" || n.audience === "SPECIFIC_CLASS" || n.audience === "SPECIFIC_SECTION"');
pContent = pContent.replace(/notice.priority.toLowerCase\(\) \} Priority/g, 'School Notice}');
fs.writeFileSync('src/pages/parent/ParentNotices.tsx', pContent);

let tContent = fs.readFileSync('src/pages/teacher/TeacherNotices.tsx', 'utf8');
tContent = tContent.replace(/publishedAt/g, 'publishDate');
tContent = tContent.replace(/n.audience.includes\("TEACHERS"\) || n.audience.includes\("ALL"\) || n.audience.includes\("STAFF"\)/g, 'n.audience === "ALL_TEACHERS"');
tContent = tContent.replace(/notice.priority.toLowerCase\(\) \} Priority/g, 'School Notice}');
fs.writeFileSync('src/pages/teacher/TeacherNotices.tsx', tContent);

let aContent = fs.readFileSync('src/pages/admin/AdminNoticesAnalytics.tsx', 'utf8');
aContent = aContent.replace(/n.audience.includes\("PARENTS"\) || n.audience.includes\("ALL"\)/g, 'n.audience === "ALL_PARENTS"');
aContent = aContent.replace(/n.audience.includes\("TEACHERS"\) || n.audience.includes\("ALL"\)/g, 'n.audience === "ALL_TEACHERS"');
fs.writeFileSync('src/pages/admin/AdminNoticesAnalytics.tsx', aContent);
console.log('Notices patched');
