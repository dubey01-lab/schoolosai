const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminTeachers.tsx', 'utf-8');

const exportLogic = `
  import { downloadCSV } from "../../lib/exportUtils";
  import { Plus, Search, Check, Mail, Phone, BookOpen, Download } from "lucide-react";
`;

content = content.replace('import { Plus, Search, Check, Mail, Phone, BookOpen } from "lucide-react";', exportLogic);

const exportFn = `
  const handleExport = () => {
    if (teachers.length === 0) return toast.error("No teachers to export");
    const data = teachers.map(t => ({
      ID: t.id,
      Name: t.name,
      Email: t.email,
      Phone: t.phone,
      Subject: t.subject,
      Qualification: t.qualification,
      Experience: t.experience,
      JoinedAt: t.joiningDate
    }));
    downloadCSV(data, 'teachers_list.csv');
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

fs.writeFileSync('src/pages/admin/AdminTeachers.tsx', content);
