const fs = require('fs');
let content = fs.readFileSync('src/pages/superadmin/SuperAdminSchoolManage.tsx', 'utf8');

content = content.replace(`  if (loading) {
      const handleResetPassword = async () => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, school.principalEmail);
      toast.success("Password reset email sent to principal.");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to send reset email.");
    }
  };
  return (`, `  const handleResetPassword = async () => {
    if (!school) return;
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, school.principalEmail);
      toast.success("Password reset email sent to principal.");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to send reset email.");
    }
  };

  if (loading) {
    return (`);

fs.writeFileSync('src/pages/superadmin/SuperAdminSchoolManage.tsx', content);
