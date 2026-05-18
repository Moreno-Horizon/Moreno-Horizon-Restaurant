import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALfHIch68va7Xb-TQxAj9KinA0PexGgCk",
  authDomain: "moreno-horizon-restaurant.firebaseapp.com",
  projectId: "moreno-horizon-restaurant",
  storageBucket: "moreno-horizon-restaurant.firebasestorage.app",
  messagingSenderId: "455054479061",
  appId: "1:455054479061:web:f8924efc9ac96072589c5c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    console.log("Checking bookings...");
    const q = query(collection(db, "bookings"), limit(5));
    const snapshot = await getDocs(q);
    console.log(`Found \${snapshot.size} bookings.`);
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
    
    console.log("Checking users...");
    const uQ = query(collection(db, "users"), limit(5));
    const uSnapshot = await getDocs(uQ);
    console.log(`Found \${uSnapshot.size} users.`);
    uSnapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  } catch (e) {
    console.error("Error:", e);
  }
}

check();
