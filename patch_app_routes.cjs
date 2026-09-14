const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const newImports = `import TeacherMarks from "./pages/teacher/TeacherMarks";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import TeacherProgress from "./pages/teacher/TeacherProgress";
import TeacherProfile from "./pages/teacher/TeacherProfile";`;

if (!content.includes('TeacherMarks')) {
    content = content.replace('import TeacherDashboard from "./pages/teacher/TeacherDashboard";', 'import TeacherDashboard from "./pages/teacher/TeacherDashboard";\\n' + newImports);
    
    const newRoutes = `              <Route path="marks" element={<TeacherMarks />} />
              <Route path="timetable" element={<TeacherTimetable />} />
              <Route path="progress" element={<TeacherProgress />} />
              <Route path="profile" element={<TeacherProfile />} />`;
              
    content = content.replace('<Route path="homework" element={<TeacherHomework />} />', '<Route path="homework" element={<TeacherHomework />} />\\n' + newRoutes);
    fs.writeFileSync('src/App.tsx', content);
}
