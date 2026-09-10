const fs = require('fs');
let content = fs.readFileSync('src/pages/public/LoginPage.tsx', 'utf-8');

// Replace 1: useEffect redirect
content = content.replace(
  /if \(userData\.role === "SUPER_ADMIN"\) \{\s+return; \/\/ Handled in render now\s+\} else if \(userData\.role === "ADMIN"\) navigate\("\/admin\/dashboard"\);\s+else if \(userData\.role === "TEACHER"\) navigate\("\/teacher\/dashboard"\);\s+else if \(userData\.role === "PARENT"\) navigate\("\/parent\/dashboard"\);/,
  `if (userData.role === "SUPER_ADMIN") {
        toast.error("Super Admin accounts must use the Super Admin Portal.");
        navigate("/superadmin/login");
      } else if (userData.role === "ADMIN") navigate("/admin/dashboard");
      else if (userData.role === "TEACHER") navigate("/teacher/dashboard");
      else if (userData.role === "PARENT") navigate("/parent/dashboard");`
);

// Replace 2: Remove the SUPER_ADMIN render block entirely
content = content.replace(
  /if \(userData\?\.role === "SUPER_ADMIN"\) \{\s+return \([\s\S]*?\);\s+\}/,
  ``
);

// Replace 3: Update login UI texts
content = content.replace(
  /<h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back<\/h1>/,
  `<h1 className="text-3xl font-bold text-slate-900 tracking-tight">SchoolOS AI Login</h1>`
);
content = content.replace(
  /<p className="text-slate-500 mt-2">Sign in to your SchoolOS AI account<\/p>/,
  `<p className="text-slate-500 mt-2">Principal / Teacher / Parent</p>`
);

// Replace 4: Remove the Setup link
content = content.replace(
  /<div className="mt-6 text-center text-sm text-slate-500">\s+First time installation\? <a href="\/setup" className="text-indigo-600 font-medium hover:underline">Initialize Platform<\/a>\s+<\/div>/,
  ``
);

fs.writeFileSync('src/pages/public/LoginPage.tsx', content);

// Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
// Remove SetupPage import
appContent = appContent.replace(/import SetupPage from ".\/pages\/public\/SetupPage";\n/, '');
// Remove Setup route
appContent = appContent.replace(/<Route path="\/setup" element={<SetupPage \/>} \/>\n/, '');

// Fix global shortcuts
appContent = appContent.replace(
  /navigate\('\/login\?role=superadmin'\);/,
  `navigate('/superadmin/login');`
);

fs.writeFileSync('src/App.tsx', appContent);

