const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /if \(\!user\) \{\n\s+return <Navigate to="\/login" \/>;\n\s+\}/,
  `if (!user) {
    if (window.location.pathname.startsWith('/superadmin') && window.location.pathname !== '/superadmin/login') {
      return <Navigate to="/superadmin/login" />;
    }
    return <Navigate to="/login" />;
  }`
);

fs.writeFileSync('src/App.tsx', content);
console.log('ProtectedRoute patched');
