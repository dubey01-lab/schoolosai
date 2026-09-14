import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDocs, getDoc, query, collection, where, deleteDoc, addDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, "ai-studio-schoolosai-09bd2bc1-a7ec-40df-90ff-85e7870d40b4");

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

async function run() {
  const taUid = (await signInWithEmailAndPassword(auth, 'teachera@schoolos.ai', 'password123')).user.uid;
  
  let noteId = '';
  await runTest('Teacher A creates quick note', async () => {
    const docRef = await addDoc(collection(db, 'teacher_notes'), { schoolId: 'schoolA', teacherId: taUid, classStr: '10-A', content: 'Test note' });
    noteId = docRef.id;
  });
  
  await runTest('Teacher A edits quick note', async () => {
    await setDoc(doc(db, 'teacher_notes', noteId), { content: 'Updated note' }, { merge: true });
  });

  await signInWithEmailAndPassword(auth, 'teacherb@schoolos.ai', 'password123');
  
  await expectPermissionDenied('Teacher B cannot edit Teacher A note', async () => {
    await setDoc(doc(db, 'teacher_notes', noteId), { content: 'Hacked' }, { merge: true });
  });
  
  await expectPermissionDenied('Teacher B cannot delete Teacher A note', async () => {
    await deleteDoc(doc(db, 'teacher_notes', noteId));
  });
  
  await signInWithEmailAndPassword(auth, 'teachera@schoolos.ai', 'password123');
  await runTest('Teacher A deletes own quick note', async () => {
    await deleteDoc(doc(db, 'teacher_notes', noteId));
  });

  console.log('Done');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
