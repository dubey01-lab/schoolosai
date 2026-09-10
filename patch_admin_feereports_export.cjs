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
if (!code.includes('const handleExport')) {
  code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + handleExport);
}
fs.writeFileSync('src/pages/admin/AdminFeeReports.tsx', code);
