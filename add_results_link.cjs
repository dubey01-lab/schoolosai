const fs = require('fs');
let content = fs.readFileSync('src/pages/parent/ParentDashboard.tsx', 'utf-8');

const resultsLink = `
        <Link to="/parent/results" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
           <div className="flex items-start justify-between mb-4">
             <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform">
               <FileText className="w-6 h-6" />
             </div>
           </div>
           <h3 className="text-sm font-medium text-slate-500">Results</h3>
           <p className="text-2xl font-bold text-slate-900 mt-1">View Marks</p>
           <p className="text-xs font-medium text-fuchsia-600 mt-2">Latest exams</p>
        </Link>
`;

content = content.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"');
content = content.replace('</Link>\n      </div>', '</Link>\n' + resultsLink + '      </div>');

fs.writeFileSync('src/pages/parent/ParentDashboard.tsx', content);
