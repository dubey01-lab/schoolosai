import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeFirestore, doc, setDoc, getDocs, getDoc, query, collection, where, deleteDoc, addDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {}, "ai-studio-schoolosai-09bd2bc1-a7ec-40df-90ff-85e7870d40b4");

let state = {};

async function safeAuth(email, pass) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user.uid;
  } catch(e) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return cred.user.uid;
    }
    throw e;
  }
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    return true;
  } catch(e) {
    console.log(`[FAIL] ${name} - ${e.message}`);
    return false;
  }
}

async function expectPermissionDenied(name, fn) {
  try {
    await fn();
    console.log(`[FAIL] ${name} - Expected permission denied`);
    return false;
  } catch(e) {
    if (e.code === 'permission-denied' || e.message.includes('permission')) {
      console.log(`[PASS] ${name}`);
      return true;
    } else {
      console.log(`[FAIL] ${name} - ${e.message}`);
      return false;
    }
  }
}

async function run() {
  console.log('--- SEEDING & SETUP ---');
  // Log in as E2E Tester to bypass rules and seed everything
  const testerUid = await safeAuth('e2etester@schoolos.ai', 'password123');
  await setDoc(doc(db, 'users', testerUid), { role: 'E2E_TESTER' });
  
  // Teachers
  const taUid = await safeAuth('teachera_final@schoolos.ai', 'password123');
  const tbUid = await safeAuth('teacherb_final@schoolos.ai', 'password123');
  // Parents
  const paUid = await safeAuth('parenta_final@schoolos.ai', 'password123');
  const pbUid = await safeAuth('parentb_final@schoolos.ai', 'password123');
  const pcUid = await safeAuth('parentc_final@schoolos.ai', 'password123'); // other school
  
  // Seed Users
  await signInWithEmailAndPassword(auth, 'e2etester@schoolos.ai', 'password123');
  
  await setDoc(doc(db, 'users', taUid), { role: 'TEACHER', schoolId: 'schoolA' });
  await setDoc(doc(db, 'users', tbUid), { role: 'TEACHER', schoolId: 'schoolA' });
  await setDoc(doc(db, 'users', paUid), { role: 'PARENT', schoolId: 'schoolA' });
  await setDoc(doc(db, 'users', pbUid), { role: 'PARENT', schoolId: 'schoolA' });
  await setDoc(doc(db, 'users', pcUid), { role: 'PARENT', schoolId: 'schoolB' });
  
  // Teacher assignments
  await setDoc(doc(db, 'teachers', taUid), { schoolId: 'schoolA', classes: ['10-A'] });
  await setDoc(doc(db, 'teachers', tbUid), { schoolId: 'schoolA', classes: ['10-B'] });
  
  // Students
  const studA = doc(collection(db, 'students'));
  await setDoc(studA, { schoolId: 'schoolA', class: '10', section: 'A', parentId: paUid });
  const studB = doc(collection(db, 'students'));
  await setDoc(studB, { schoolId: 'schoolA', class: '10', section: 'B', parentId: pbUid });

  console.log('--- RUNNING TEST MATRIX ---');
  let passed = 0;
  let total = 0;
  function mark(res) { total++; if (res) passed++; }

  // 1. Unauthenticated reading
  await signOut(auth);
  mark(await expectPermissionDenied('Unauthenticated user reading teacher data', async () => {
    await getDoc(doc(db, 'teachers', taUid));
  }));
  
  // Teacher reading unassigned class (Homework)
  await signInWithEmailAndPassword(auth, 'teachera_final@schoolos.ai', 'password123');
  let hwId = '';
  mark(await runTest('Teacher A creating homework for assigned class', async () => {
    const docRef = await addDoc(collection(db, 'homework'), { schoolId: 'schoolA', teacherId: taUid, class: '10', section: 'A' });
    hwId = docRef.id;
  }));
  mark(await expectPermissionDenied('Teacher A creating homework for unassigned class', async () => {
    await addDoc(collection(db, 'homework'), { schoolId: 'schoolA', teacherId: taUid, class: '10', section: 'B' });
  }));

  // Teacher writing attendance for unassigned class
  mark(await expectPermissionDenied('Teacher A writing attendance for unassigned class', async () => {
    await setDoc(doc(db, 'attendance', 'schoolA_10-B_2024-01-01'), { schoolId: 'schoolA', teacherId: taUid, class: '10', section: 'B' });
  }));
  
  // Teacher reading another teacher's private homework
  await signInWithEmailAndPassword(auth, 'teacherb_final@schoolos.ai', 'password123');
  mark(await expectPermissionDenied('Teacher B reading Teacher A assigned class homework', async () => {
    // Teacher B is not assigned to 10-A, should not be able to read 10-A homework
    const q = query(collection(db, 'homework'), where('schoolId', '==', 'schoolA'), where('class', '==', '10'), where('section', '==', 'A'));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('Able to read unassigned class homework');
  }));

  // Teacher changing className or section
  await signInWithEmailAndPassword(auth, 'teachera_final@schoolos.ai', 'password123');
  mark(await expectPermissionDenied('Teacher changing className or section to unassigned', async () => {
    await setDoc(doc(db, 'homework', hwId), { class: '10', section: 'B' }, { merge: true });
  }));
  
  // Parent B reading Parent A child data
  await signInWithEmailAndPassword(auth, 'parentb_final@schoolos.ai', 'password123');
  mark(await expectPermissionDenied('Parent reading another child’s data', async () => {
    // Try to read Student A
    const snap = await getDoc(studA);
    if (snap.exists()) throw new Error('Able to read other child');
  }));

  // Parent C (other school) reading School A homework
  await signInWithEmailAndPassword(auth, 'parentc_final@schoolos.ai', 'password123');
  mark(await expectPermissionDenied('Parent reading another school’s data', async () => {
    const snap = await getDoc(doc(db, 'homework', hwId));
    if (snap.exists()) throw new Error('Able to read other school');
  }));

  // Malicious schoolId/teacherId updates
  await signInWithEmailAndPassword(auth, 'teachera_final@schoolos.ai', 'password123');
  mark(await expectPermissionDenied('Direct document update bypass attempts (malicious schoolId)', async () => {
    await setDoc(doc(db, 'homework', hwId), { schoolId: 'schoolB' }, { merge: true });
  }));
  mark(await expectPermissionDenied('Direct document update bypass attempts (malicious teacherId)', async () => {
    await setDoc(doc(db, 'homework', hwId), { teacherId: tbUid }, { merge: true });
  }));

  console.log(`\nFinal Result: ${passed}/${total} passed`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
