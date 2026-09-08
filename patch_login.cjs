const fs = require('fs');
let content = fs.readFileSync('src/pages/public/LoginPage.tsx', 'utf8');

content = content.replace(/if \(userData\.role === "SUPER_ADMIN"\) navigate\("\/superadmin\/dashboard"\);\n\s+else if \(userData\.role === "ADMIN"\) navigate\("\/admin\/dashboard"\);/, 
  `if (userData.role === "SUPER_ADMIN") {
        return; // Handled in render now
      } else if (userData.role === "ADMIN") navigate("/admin/dashboard");`);

let jsxToInsert = `
  if (userData?.role === "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <GraduationCap className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Platform Administrator</h2>
          <p className="text-slate-500 mb-6">This account is a platform administrator. Please use the Super Admin login.</p>
          <button 
            onClick={() => navigate('/superadmin/login')}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-all"
          >
            Go to Super Admin Login
          </button>
        </div>
      </div>
    );
  }
`;

content = content.replace('return (', `${jsxToInsert}\n  return (`);
fs.writeFileSync('src/pages/public/LoginPage.tsx', content);
console.log('LoginPage patched');
