// Garden — Firebase setup
// 1. Create a project at https://console.firebase.google.com
// 2. Enable Authentication > Sign-in method > Email/Password
// 3. Enable Firestore Database (start in production mode, add rules below)
// 4. Project settings > General > Your apps > Web app > copy the config below
// 5. Firestore rules (Firestore > Rules):
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /gifts/{giftId} {
//         allow read: if true;                 // recipients open gifts without login
//         allow create: if request.auth != null;
//         allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
//       }
//       match /users/{userId} {
//         allow create: if request.auth != null && request.auth.uid == userId;
//         allow read, update: if request.auth != null && request.auth.uid == userId;
//       }
//     }
//   }

const firebaseConfig = {
  apiKey: "AIzaSyCKTsMTdpX1_MaiSkaI7MgXBVmUeXCPMgw",
  authDomain: "flower-91e74.firebaseapp.com",
  projectId: "flower-91e74",
  storageBucket: "flower-91e74.firebasestorage.app",
  messagingSenderId: "797148117535",
  appId: "1:797148117535:web:c8fc76dddcd9cf6c29f32a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
