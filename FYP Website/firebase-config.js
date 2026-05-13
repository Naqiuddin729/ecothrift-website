/* ── ECOTHRIFT FIREBASE CONFIG ──────────────────────────────────────────────
   Gantikan nilai YOUR_* dengan nilai dari Firebase Console anda:
   Firebase Console → Project Settings → Your apps → SDK setup and configuration
   ────────────────────────────────────────────────────────────────────────── */

const firebaseConfig = {
  apiKey:            "AIzaSyBTTBRXVMbz6IJF7jTERy9zHuZUgbwrMR0",
  authDomain:        "ecothrift-c0a5f.firebaseapp.com",
  projectId:         "ecothrift-c0a5f",
  storageBucket:     "ecothrift-c0a5f.firebasestorage.app",
  messagingSenderId: "682441187901",
  appId:             "1:682441187901:web:0bac52b897f4ebba56c054",
  measurementId:     "G-535KVWFX5T"
};

firebase.initializeApp(firebaseConfig);

const auth      = firebase.auth();
const db        = firebase.firestore();
const storage   = firebase.storage();
const analytics = firebase.analytics();
