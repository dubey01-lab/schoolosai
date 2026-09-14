import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDocs, getDoc, query, collection, where, deleteDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, "ai-studio-schoolosai-09bd2bc1-a7ec-40df-90ff-85e7870d40b4");

let state = {};

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch(e) {
    console.log(`[FAIL] ${name} - ${e.message}`);
  }
}

async function expectPermissionDenied(name, fn) {
  try {
    await fn();
    console.log(`[FAIL] ${name} - Expected permission denied`);
  } catch(e) {
    if (e.code === 'permission-denied') console.log(`[PASS] ${name}`);
    else console.log(`[FAIL] ${name} - ${e.message}`);
  }
}

async function runExtra() {
  const taUid = (await signInWithEmailAndPassword(auth, 'teachera@schoolos.ai', 'password123')).user.uid;
  
  // Test 25: Timetable create
  let ttId = doc(collection(db, 'timetable')).id;
  await runTest('25. Teacher A creates timetable record', async () => {
    await setDoc(doc(db, 'timetable', ttId), { schoolId: 'schoolA', teacherId: taUid, subject: 'Math', day: 'Monday' });
  });
  
  // Test 26: Timetable edit
  await runTest('26. Teacher A edits own timetable record', async () => {
    await setDoc(doc(db, 'timetable', ttId), { subject: 'Science' }, { merge: true });
  });
  
  // Test 28: Progress create
  let progId = doc(collection(db, 'classProgress')).id;
  await runTest('28. Teacher A creates class progress record', async () => {
    await setDoc(doc(db, 'classProgress', progId), { schoolId: 'schoolA', teacherId: taUid, title: 'Chapter 1' });
  });
  
  // Test 29: Progress edit
  await runTest('29. Teacher A edits own progress record', async () => {
    await setDoc(doc(db, 'classProgress', progId), { title: 'Chapter 2' }, { merge: true });
  });

  // Switch to Teacher B
  await signInWithEmailAndPassword(auth, 'teacherb@schoolos.ai', 'password123');
  
  await expectPermissionDenied('27. Teacher B cannot edit Teacher A timetable record', async () => {
    await setDoc(doc(db, 'timetable', ttId), { subject: 'Hacked' }, { merge: true });
  });
  
  await expectPermissionDenied('30. Teacher B cannot edit Teacher A progress record', async () => {
    await setDoc(doc(db, 'classProgress', progId), { title: 'Hacked' }, { merge: true });
  });
  
  console.log('--- EXTRA TESTS COMPLETE ---');
  process.exit(0);
}

runExtra().catch(e => { console.error(e); process.exit(1); });
