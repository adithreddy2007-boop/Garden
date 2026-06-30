// Garden — Firebase setup
// 1. Create a project at https://console.firebase.google.com
// 2. Enable Authentication > Sign-in method > Email/Password AND Google
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
//     }
//   }

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
