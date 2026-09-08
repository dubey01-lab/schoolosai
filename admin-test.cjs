const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');

// Mock credential for AI studio environment
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: serviceAccount.projectId
  });
}

const db = admin.firestore();

async function run() {
  const schools = await db.collection('schools').get();
  console.log("SCHOOLS:", schools.size);
  schools.forEach(doc => console.log(doc.id, doc.data()));

  const users = await db.collection('users').get();
  console.log("USERS:", users.size);
  users.forEach(doc => console.log(doc.id, doc.data()));

  process.exit(0);
}
run();
