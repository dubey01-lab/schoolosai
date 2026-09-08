import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

let secondaryApp: any;

function generateRandomPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const createAccountSecurely = async (email: string, userData: { name: string, role: UserRole, schoolId?: string }) => {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
  }
  const secondaryAuth = getAuth(secondaryApp);
  
  const tempPassword = generateRandomPassword();
  
  // Create user in Firebase Auth using the secondary app (avoids logging out current user)
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
  const newUid = userCredential.user.uid;
  
  // Sign out the secondary app
  await secondaryAuth.signOut();
  
  // Write to Firestore using the PRIMARY app (current user's auth token)
  await setDoc(doc(db, "users", newUid), {
    uid: newUid,
    email: email,
    name: userData.name,
    role: userData.role,
    schoolId: userData.schoolId || null,
    createdAt: new Date().toISOString()
  });
  
  // Trigger a password reset email from the main auth
  const primaryAuth = getAuth();
  try {
    await sendPasswordResetEmail(primaryAuth, email);
  } catch (e) {
    console.error("Failed to send password reset email:", e);
    // Continue anyway as the account is created
  }
  
  return newUid;
};
