const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = code.replace('import { Bar, Doughnut } from "react-chartjs-2";', 'import { Bar, Doughnut } from "react-chartjs-2";\nimport { downloadCSV } from "../../lib/exportUtils";');
}

const handleExport = `
  const handleExport = () => {
    const data = [
      { Metric: "Total Students", Value: stats.totalStudents },
      { Metric: "Total Teachers", Value: stats.totalTeachers },
      { Metric: "Total Fees", Value: stats.totalFees }
    ];
    downloadCSV(data, \`dashboard_report_\${new Date().getTime()}.csv\`);
  };
`;
if (!code.includes('handleExport')) {
  code = code.replace('const { userData } = useAuth();', 'const { userData } = useAuth();\n' + handleExport);
}

code = code.replace('<button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Download Report</button>', '<button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Download Report</button>');

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log('Patched AdminDashboard.tsx');
