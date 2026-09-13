const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf-8');

// I'll add an export function:
const exportLogic = `
  import { downloadCSV } from "../../lib/exportUtils";
  import { Plus, Search, Check, FileText, Download } from "lucide-react";
`;

content = content.replace('import { Plus, Search, Check, FileText } from "lucide-react";', exportLogic);

const exportFn = `
  const handleExport = () => {
    if (students.length === 0) return toast.error("No students to export");
    const data = students.map(s => ({
      ID: s.id,
      Name: s.name,
      Class: s.class,
      Section: s.section,
      RollNo: s.rollNumber,
      Gender: s.gender,
      DOB: s.dateOfBirth,
      Address: s.address,
      ParentName: s.parentName,
      ParentEmail: s.parentEmail,
      ParentPhone: s.parentPhone,
      JoinedAt: s.createdAt
    }));
    downloadCSV(data, 'students_list.csv');
  };
`;

content = content.replace('useEffect(() => {', exportFn + '\n  useEffect(() => {');

const buttonStr = `
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
             <Download className="w-5 h-5" /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
`;

content = content.replace('<button \n          onClick={() => setIsAddModalOpen(true)}', buttonStr);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', content);
