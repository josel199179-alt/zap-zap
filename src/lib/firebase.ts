import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "isometric-conduit-rq6d2",
  appId: "1:1098223857466:web:37da436e3c1160e0d92a03",
  apiKey: "AIzaSyBXyFkVVhjo5hDq8eBZIy4oHcJgebJtZok",
  authDomain: "isometric-conduit-rq6d2.firebaseapp.com",
  storageBucket: "isometric-conduit-rq6d2.firebasestorage.app",
  messagingSenderId: "1098223857466"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
