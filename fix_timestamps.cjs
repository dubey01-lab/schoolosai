const fs = require('fs');

const files = [
    'src/pages/teacher/TeacherHomework.tsx',
    'src/pages/teacher/TeacherMarks.tsx',
    'src/pages/teacher/TeacherNotices.tsx',
    'src/pages/teacher/TeacherTimetable.tsx',
    'src/pages/teacher/TeacherProgress.tsx',
    'src/pages/teacher/TeacherAttendance.tsx',
    'src/pages/teacher/TeacherProfile.tsx'
];

for (const f of files) {
    let text = fs.readFileSync(f, 'utf-8');
    if (!text.includes('serverTimestamp')) {
        text = text.replace('} from "firebase/firestore";', ', serverTimestamp } from "firebase/firestore";');
    }
    
    // For specific assignments, revert the forms' initial states which need standard ISO strings
    // but keep serverTimestamp for the payload.
    // The previous sed command ruined `assignedDate: new Date().toISOString().split('T')[0]` 
    text = text.replace(/assignedDate: serverTimestamp\(\)\.split\('T'\)\[0\]/g, "assignedDate: new Date().toISOString().split('T')[0]");
    text = text.replace(/publishDate: serverTimestamp\(\)\.split\('T'\)\[0\]/g, "publishDate: new Date().toISOString().split('T')[0]");
    
    // Revert form resets
    text = text.replace(/serverTimestamp\(\)\.split\('T'\)\[0\]/g, "new Date().toISOString().split('T')[0]");
    
    // Ensure we are using serverTimestamp for updatedAt and createdAt
    text = text.replace(/updatedAt: new Date\(\)\.toISOString\(\)/g, "updatedAt: serverTimestamp()");
    text = text.replace(/createdAt: new Date\(\)\.toISOString\(\)/g, "createdAt: serverTimestamp()");
    text = text.replace(/\(payload as any\)\.createdAt = new Date\(\)\.toISOString\(\);/g, "(payload as any).createdAt = serverTimestamp();");
    text = text.replace(/payload\.createdAt = new Date\(\)\.toISOString\(\);/g, "payload.createdAt = serverTimestamp();");
    
    fs.writeFileSync(f, text);
}
