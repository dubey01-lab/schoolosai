const fs = require('fs');
let code = fs.readFileSync('src/pages/teacher/TeacherAttendance.tsx', 'utf-8');

// We need to find the specific state and getDoc call
code = code.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [errorMsg, setErrorMsg] = useState("");'
);

code = code.replace(
  /const attSnap = await getDoc\(attRef\)\.catch\(err => \{ if \(err\.code === "permission-denied"\) return null; throw err; \}\);/,
  `let attSnap = null;
      try {
        attSnap = await getDoc(attRef);
      } catch (err: any) {
        if (err.code === "permission-denied" || err.message.includes("permission")) {
          setErrorMsg("You do not have permission to access this data.");
          setLoading(false);
          return;
        }
        throw err;
      }`
);

// We should also replace the catch for the student fetch
const studentFetchStr = `const snap = await getDocs(q);`;
const studentFetchReplace = `let snap = null;
      try {
        snap = await getDocs(q);
      } catch (err: any) {
        if (err.code === "permission-denied" || err.message.includes("permission")) {
          setErrorMsg("You do not have permission to access this data.");
          setLoading(false);
          return;
        }
        throw err;
      }`;
code = code.replace(studentFetchStr, studentFetchReplace);

// Let's ensure the UI shows the error
code = code.replace(
  '{loading ? (',
  '{errorMsg ? (\n        <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-8 text-center text-red-600">\n          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />\n          <h3 className="text-lg font-bold mb-1">Access Denied</h3>\n          <p>{errorMsg}</p>\n        </div>\n      ) : loading ? ('
);

fs.writeFileSync('src/pages/teacher/TeacherAttendance.tsx', code);
