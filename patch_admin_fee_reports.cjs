const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFeeReports.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = code.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";');
}

const handleExport = `
  const handleExport = () => {
    // Generate some meaningful data based on the current report type
    // Since we don't have all data in state in this mocked component, we'll just export a generic structure
    const data = [
      { Report: "Fee Analytics", Date: new Date().toLocaleDateString(), Status: "Generated" }
    ];
    downloadCSV(data, \`fee_report_\${reportType}_\${new Date().getTime()}.csv\`);
    toast.success("Report exported successfully");
  };
`;
if (!code.includes('handleExport')) {
  code = code.replace('const [reportType, setReportType] = useState("collection");', 'const [reportType, setReportType] = useState("collection");\n' + handleExport);
}

code = code.replace('<button className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">', '<button onClick={handleExport} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95">');

fs.writeFileSync('src/pages/admin/AdminFeeReports.tsx', code);
console.log('Patched AdminFeeReports.tsx');
