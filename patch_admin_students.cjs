const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminStudents.tsx', 'utf8');

content = content.replace(/let parentId = "dummy-parent-id";[\s\S]*?throw authErr;\s*\}\s*\}/, `let parentId = "";
      
      try {
        parentId = await createAccountSecurely(parentEmail, {
          name: parentName,
          role: "PARENT",
          schoolId: userData.schoolId
        });
        toast.success("Created Parent account and sent setup email.");
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.message?.includes('email-already-in-use')) {
          const pq = query(collection(db, "users"), where("email", "==", parentEmail), where("schoolId", "==", userData.schoolId));
          const pSnap = await getDocs(pq);
          if (!pSnap.empty) {
            parentId = pSnap.docs[0].id;
            toast.success("Linked to existing Parent account.");
          } else {
            throw new Error("Email in use by a different school or user record not found.");
          }
        } else {
          throw authErr;
        }
      }
      
      if (!parentId) throw new Error("Failed to resolve parent account.");`);

fs.writeFileSync('src/pages/admin/AdminStudents.tsx', content);
console.log('AdminStudents updated');
