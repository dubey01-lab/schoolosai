const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminAttendance.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = code.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";');
}

const handleExport = `
  const handleExport = () => {
    if (students.length === 0) {
      toast.error("No data to export");
      return;
    }
    const data = students.map(s => ({
      ID: s.rollNumber || s.id,
      Name: s.name,
      Class: s.class,
      Section: s.section,
      Status: attendanceState[s.id!] || "Not Marked"
    }));
    downloadCSV(data, \`attendance_\${selectedClass}_\${selectedSection}_\${date}.csv\`);
    toast.success("Export successful");
  };
`;
if (!code.includes('handleExport')) {
  code = code.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n' + handleExport);
}

code = code.replace('<button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">', '<button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">');

fs.writeFileSync('src/pages/admin/AdminAttendance.tsx', code);
console.log('Patched AdminAttendance.tsx');
