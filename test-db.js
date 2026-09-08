import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "schools"));
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  console.log("USERS:");
  const users = await getDocs(collection(db, "users"));
  users.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  process.exit(0);
}
run();
