const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = code.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";');
}

const handleExport = `
  const handleExport = () => {
    if (fees.length === 0) {
      toast.error("No data to export");
      return;
    }
    const data = fees.map(f => ({
      FeeType: f.feeId,
      TotalAmount: f.totalAmount,
      PaidAmount: f.paidAmount,
      PendingAmount: f.pendingAmount,
      Status: f.status,
      DueDate: f.dueDate
    }));
    downloadCSV(data, \`fees_\${new Date().getTime()}.csv\`);
    toast.success("Export successful");
  };
`;
if (!code.includes('handleExport')) {
  code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + handleExport);
}

code = code.replace('<button className="flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">', '<button onClick={handleExport} className="flex-1 sm:flex-none bg-white text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">');

fs.writeFileSync('src/pages/admin/AdminFees.tsx', code);
console.log('Patched AdminFees.tsx');
