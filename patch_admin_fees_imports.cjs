const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFees.tsx', 'utf8');

if (!code.includes('import { downloadCSV }')) {
  code = 'import toast from "react-hot-toast";\nimport { downloadCSV } from "../../lib/exportUtils";\n' + code;
}

if (!code.includes('const [fees, setFees] = useState<StudentFee[]>([]);')) {
  code = code.replace('const [loading, setLoading] = useState(true);', 'const [fees, setFees] = useState<StudentFee[]>([]);\n  const [loading, setLoading] = useState(true);');
}

fs.writeFileSync('src/pages/admin/AdminFees.tsx', code);
console.log('Patched AdminFees imports');
