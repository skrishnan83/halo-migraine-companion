# halo — AI migraine care companion

**halo** is a mobile app that helps people with migraine log attacks quickly, learn which treatments actually work for them, and share a clear report with their doctor. It is built with React Native (Expo), TypeScript and Firebase, by **BatWarriors LLC**.

> halo gives general information only and is not a substitute for medical advice.

|                       |                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Current release**   | Sprint 1: Welcome, About halo and user accounts                                          |
| **Next**              | Sprint 2: Log a Migraine, My Medications, relief ratings, History and Trends, PDF report |
| **Platform**          | iPhone and Android, through Expo Go (Expo SDK 58)                                        |
| **Video walkthrough** | [Sprint 1 review on YouTube](https://youtu.be/q9u9FglU0hU)                               |
| **LinkedIn**          | [Sprint 1 review on LinkedIn](https://www.linkedin.com/posts/krishnansmita_halo-ai-migraine-care-companion-sprint-activity-7524269944428072960-sfyS?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAL-jvEBG3XA5cCh-Z3noyzpP1Fi4LZ61wk)                                                      |

---

## Sprint 1 features (implemented and tested)

| Feature              | What it does                                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Splash**           | Shows the halo logo for about 2.5 seconds, then opens Welcome.                                                                                                                                                                     |
| **Welcome**          | Log In, Create Account, and an About halo link.                                                                                                                                                                                    |
| **About halo**       | Explains what the app does today and what is coming next.                                                                                                                                                                          |
| **Create Account**   | Email, password and confirm password. The password needs 15+ characters, an uppercase letter, a lowercase letter, a number and a special character; a live checklist ticks each rule. A new account opens **Log In** (never Home). |
| **Log In**           | Checked by Firebase Authentication. Wrong details show "Email or password is incorrect." with the attempt number; the **3rd failed attempt opens Forgot Password**.                                                                |
| **Forgot Password**  | Firebase emails a reset link, then the app shows **Check Your Inbox**. The same message is shown for every address, so accounts stay private.                                                                                      |
| **Stay logged in**   | After a successful log in, halo opens straight to Home, even after the app is closed.                                                                                                                                              |
| **Home and Log Out** | Home greets the person; Log Out returns to the splash and Welcome.                                                                                                                                                                 |
| **Private data**     | A profile is saved in Cloud Firestore, and security rules let each person read and write only their own data.                                                                                                                      |

Full Sprint 1 documentation, including UI designs, the test log and the feedback decision log, is in [`docs/sprint-1`](docs/sprint-1/README.md).

---

## Tech stack

- **React Native + Expo** (SDK 58), **TypeScript**
- **React Navigation** (native stack)
- **Firebase Authentication** (email and password) and **Cloud Firestore**
- **AsyncStorage**, which keeps the log in on the phone

## Project structure

```
app/
├── App.tsx                 # navigation: signed-out stack and signed-in stack
├── src/
│   ├── components/         # Button, FormField, HaloLogo, PasswordChecklist, Chip
│   ├── screens/            # Splash, Welcome, About, Log In, Sign Up, Forgot Password, Home, ...
│   ├── services/           # firebase.ts, userProfile.ts, ...
│   ├── navigation/         # route types
│   ├── theme/              # halo colours
│   └── utils/              # password rules, sign-up state, ...
├── .env.example            # the variables you need (no real keys)
└── package.json
docs/
└── sprint-1/               # report, UI designs, test and feedback logs
```

## Getting started

**You need:** Node.js (LTS), the **Expo Go** app on your phone, and a Firebase project with **Email/Password** sign-in and **Cloud Firestore** turned on.

```bash
git clone https://github.com/skrishnan83/halo-migraine-companion.git
cd halo-migraine-companion/app
npm install
npx expo start              # scan the QR code with Expo Go
```

If the phone can't reach the laptop (for example on campus or office Wi-Fi), start with `npx expo start --tunnel`.

### Environment variables

All keys are read from `app/.env`, which is **never committed**. See [`app/.env.example`](app/.env.example):

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GROQ_API_KEY=
```

### Firestore security rules (pattern used)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing

Sprint 1 was tested by hand on a real iPhone (Expo Go) against the live Firebase project, and results were checked in the Firebase console. Every test, with its expected result, actual result and date, is in the [Sprint 1 test log](docs/sprint-1/test-log.md). Automated tests are planned for Sprint 4.

## Roadmap

| Sprint | Deliverable                                                                                                     | Status         |
| ------ | --------------------------------------------------------------------------------------------------------------- | -------------- |
| 0      | Approved proposal and project repository                                                                        | ✅ Done        |
| 1      | Splash, Welcome, About halo, Create Account, Log In, Forgot Password                                            | ✅ Done        |
| 2      | Log a Migraine (with voice note), My Medications, relief ratings, History and Trends, PDF report for the doctor | 🔄 In progress |
| 3      | AI layer: treatment insights, Symptom Companion, preventative alerts                                            | Planned        |
| 4      | Harden and demo: security review, automated tests, accessibility                                                | Planned        |

## Team

- **Smita Krishnan**, developer ([@skrishnan83](https://github.com/skrishnan83))
- **Sai Charan Beemara**, project manager and team leader
- **Dr. V. Govindaswamy**, client

BatWarriors LLC
