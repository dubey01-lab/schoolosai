import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-schoolosai-09bd2bc1-a7ec-40df-90ff-85e7870d40b4");

async function run() {
  const schools = await getDocs(query(collection(db, 'schools'), limit(5)));
  console.log('Schools:', schools.docs.map(d => ({id: d.id, ...d.data()})));
  
  process.exit(0);
}
run();
