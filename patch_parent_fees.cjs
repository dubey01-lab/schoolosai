const fs = require('fs');
let code = fs.readFileSync('src/pages/parent/ParentFees.tsx', 'utf8');

const handlePrint = `
  const handlePrint = (txn: FeeTransaction) => {
    // In a real app we would navigate to a dedicated receipt view or generate a PDF.
    // For now, we will just use window.print()
    window.print();
  };
`;
if (!code.includes('handlePrint')) {
  code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + handlePrint);
}

code = code.replace('<button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">', '<button onClick={() => handlePrint(txn as any)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">');

fs.writeFileSync('src/pages/parent/ParentFees.tsx', code);
console.log('Patched ParentFees.tsx');
