const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFeeReports.tsx', 'utf8');

const handleExport = `
  const handleExport = () => {
    const data = [
      { Report: "Fee Analytics", Date: new Date().toLocaleDateString(), Status: "Generated" }
    ];
    downloadCSV(data, \`fee_report_\${reportType}_\${new Date().getTime()}.csv\`);
    toast.success("Report exported successfully");
  };
`;
if (!code.includes('handleExport')) {
  code = code.replace('const [reportType, setReportType] = useState("COLLECTION");', 'const [reportType, setReportType] = useState("COLLECTION");\n' + handleExport);
}
if (!code.includes('import { downloadCSV }')) {
  code = code = 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";\n' + code;
}
fs.writeFileSync('src/pages/admin/AdminFeeReports.tsx', code);
