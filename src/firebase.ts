// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";


const firebaseConfig = {
   apiKey: "AIzaSyAXlUIGjhMub1yGIr0QdyEpad7-7j1T1gg",
  authDomain: "mini-project-demo-1300a.firebaseapp.com",
  projectId: "mini-project-demo-1300a",
  storageBucket: "mini-project-demo-1300a.firebasestorage.app",
  messagingSenderId: "942655526778",
  appId: "1:942655526778:web:ea812ce0807bd6ad09a8c3",

  databaseURL: "https://mini-project-demo-1300a-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ตัวแปรสำหรับเรียกใช้งานในระบบ
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
// ล็อกอินด้วย Google และบันทึกข้อมูลผู้ใช้ลง Firestore
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastSeen: serverTimestamp()
    }, { merge: true });

    console.log("ล็อกอินสำเร็จและบันทึกข้อมูลเรียบร้อย:", user.displayName);
    return user;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการล็อกอิน:", error);
    throw error;
  }
};