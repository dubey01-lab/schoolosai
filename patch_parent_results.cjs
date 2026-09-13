const fs = require('fs');

let content = fs.readFileSync('src/pages/parent/ParentResults.tsx', 'utf-8');

if (!content.includes('const handlePrint =')) {
    content = content.replace('return (', `
  const handlePrint = (resultId: string) => {
    window.print();
  };
  return (`);

    content = content.replace(
        '<button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">',
        '<button onClick={() => handlePrint(result.id)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">'
    );

    fs.writeFileSync('src/pages/parent/ParentResults.tsx', content);
}
