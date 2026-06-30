# Garden 🌿

A romantic flower-bouquet gift builder. Static HTML/CSS/JS, Firebase Auth + Firestore, deploy on GitHub Pages.

## Setup

1. Create a Firebase project: https://console.firebase.google.com
2. Authentication → Sign-in method → enable **Email/Password** and **Google**.
3. Firestore Database → create in production mode.
4. Firestore → Rules → paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gifts/{giftId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

5. Project settings → General → Your apps → Web app → copy the config object into `js/firebase-config.js`.

## Run locally

Any static server works, e.g.:

```
cd garden
python3 -m http.server 8080
```

Open `http://localhost:8080/signup.html`.

## Deploy to GitHub Pages

Push this folder to a repo, then Settings → Pages → deploy from the branch/root. Your gift links will look like:

```
https://yourname.github.io/garden/gift.html?id=<docId>
```

## Pages

- `signup.html` / `login.html` — email+password and Google auth
- `index.html` — dashboard of gifts you've sent
- `builder.html` — the 6-step gift wizard (bouquet → lock → card → details → music → share)
- `gift.html` — what the recipient sees: loading animation → PIN gate (if set) → reveal

## Notes

- The PIN is stored in plain text on the gift document for simplicity — anyone with direct Firestore access could read it. Fine for a sentimental gift app; not meant for sensitive data.
- Photos are compressed client-side and stored inline in the Firestore document, so a gift document stays under Firestore's 1MB limit. Voice notes are short clips for the same reason — keep them brief.
- The "heart QR" masks a high-error-correction QR matrix into a heart silhouette while always keeping the three finder-pattern corners intact, so it scans like a normal code. Very heavily masked links may still want the plain "Copy link" fallback shown next to it.
- Spotify clips use the official embed iFrame API to seek to your chosen start second and pause at the end second — no login required for the recipient.
