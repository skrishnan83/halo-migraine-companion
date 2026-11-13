# halo — AI migraine care companion

**halo** is a mobile app that helps people with migraine log attacks quickly, learn which treatments actually work for them, and share a clear report with their doctor. It is built with React Native (Expo), TypeScript and Firebase, by **BatWarriors LLC**.

> halo gives general information only and is not a substitute for medical advice.

|                       |                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Current release**   | Sprint 2: Log a Migraine, Let Someone Know, offline sync, My Medications, relief ratings, History and Trends, PDF report |
| **Next**              | Sprint 3: the AI layer (treatment insights, Symptom Companion, preventative alerts)                |
| **Platform**          | iPhone and Android, through Expo Go (Expo SDK 58)                                                 |
| **Video walkthrough** | Sprint 2 on YouTube: SPRINT2_YOUTUBE_LINK · [Sprint 1 on YouTube](https://youtu.be/q9u9FglU0hU)    |
| **LinkedIn**          | Sprint 2 on LinkedIn: SPRINT2_LINKEDIN_LINK · [Sprint 1 on LinkedIn](https://www.linkedin.com/posts/krishnansmita_halo-ai-migraine-care-companion-sprint-activity-7524269944428072960-sfyS?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAL-jvEBG3XA5cCh-Z3noyzpP1Fi4LZ61wk) |

---

## Sprint 2 features (implemented and tested)

| Feature | What it does |
| --- | --- |
| **Home** | Shows "Log a Migraine", "My Medications", "History", the recent attacks, and the sync status ("All synced", "Waiting to sync" or "Offline"). |
| **Log a Migraine** | Severity from 1 "Mild" to 10 "Extreme" (required), when it started, symptoms and an optional note. "Save" stores the log on the phone first. |
| **Add a note by voice** | "Tap to speak" records a note and turns it into text with a speech-to-text AI model (Whisper, through Groq). The recording isn't saved to the account. |
| **Let Someone Know** | At severity 8 to 10, a "This is a severe attack" box appears. "Let Someone Know" opens the phone's share sheet with a ready-made message, so the person can text family or a friend. |
| **Offline save and sync** | Logs and relief ratings save on the phone with no internet and upload by themselves when the phone is back online. Each log gets its ID on the phone, so a retry never makes a duplicate. |
| **My Medications** | Add a medication with an optional usual dose, or remove one (it asks first). The list is stored per person in Cloud Firestore. |
| **Rate relief ("How Did It Go?")** | Tap an attack on Home to record what you took, how much relief you got and when it eased. The card then shows, for example, "Relief: A lot · 1 hr · Sumatriptan 100mg". |
| **History and Trends** | For 30 days, 90 days or All: attacks, average severity, how often relief was good, average time to relief, attacks per week, "What helps" (Works well, Some help, Little help) and every attack. |
| **PDF report for the doctor** | "Share PDF Report for My Doctor" makes a PDF on the phone (summary, what helped, every attack) and opens the share sheet. |

The Sprint 2 report, with the UI designs, the test log and the feedback decision log, is in [`docs/sprint-2`](docs/sprint-2/README.md).

## Sprint 1 features

Splash, Welcome, About halo, Create Account (15+ character password with a live checklist; a new account opens Log In), Log In (the 3rd failed attempt opens Forgot Password), Forgot Password, staying logged in, Log Out, and private data protected by Firestore security rules. Details are in [`docs/sprint-1`](docs/sprint-1/README.md).

---

## Tech stack

- **React Native + Expo** (SDK 58), **TypeScript**
- **React Navigation** (native stack)
- **Firebase Authentication** (email and password) and **Cloud Firestore**
- **AsyncStorage** (log in and the offline waiting list) and **NetInfo** (online or offline)
- **expo-audio** for voice notes, transcribed by **Whisper** (`whisper-large-v3-turbo`) through the Groq API
- **expo-print** and **expo-sharing** for the PDF report; React Native **Share** for "Let Someone Know"

## Project structure

```
app/
├── App.tsx                 # navigation: signed-out stack and signed-in stack
├── src/
│   ├── components/         # Button, Chip, FormField, HaloLogo, PasswordChecklist
│   ├── hooks/              # useAttacks: live list of attacks plus the waiting list
│   ├── screens/            # Splash, Welcome, About, Log In, Sign Up, Forgot Password,
│   │                       # Home, Log a Migraine (QuickLog), My Medications,
│   │                       # How Did It Go? (Relief), History
│   ├── services/           # firebase, userProfile, attackQueue (offline save and sync),
│   │                       # medications, transcribe (voice), report (PDF)
│   ├── navigation/         # route types
│   ├── theme/              # halo colours
│   └── utils/              # password rules, sign-up state, relief labels, stats
├── .env.example            # the variables you need (no real keys)
└── package.json
docs/
├── sprint-1/               # report, UI designs, test and feedback logs
└── sprint-2/               # report, UI designs, test and feedback logs
```

## Data in Cloud Firestore

Everything a person saves lives under their own user ID:

```
users/{uid}                     # profile
users/{uid}/attacks/{attackId}  # each migraine log and its relief rating
users/{uid}/medications/{id}    # My Medications
```

## Getting started

**You need:** Node.js (LTS), the **Expo Go** app on your phone, a Firebase project with **Email/Password** sign-in and **Cloud Firestore** turned on, and a Groq API key for voice notes.

```bash
git clone https://github.com/skrishnan83/halo-migraine-companion.git
cd halo-migraine-companion
git switch Sprint2
cd app
npm install
npx expo start              # scan the QR code with Expo Go
```

If the phone can't reach the laptop (for example on a shared or office Wi-Fi network), start with `npx expo start --tunnel`. Voice notes need the microphone turned on for Expo Go in the phone's Settings.

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

Sprint 2 was tested by hand on a real iPhone (Expo Go) with a test account against the live Firebase project: 18 tests, all passed. Every test, with its expected result, actual result and date, is in the [Sprint 2 test log](docs/sprint-2/test-log.md). Automated tests are planned for Sprint 4.

## Known issues

- Voice notes need internet, because the speech-to-text service is online.
- Adding or removing a medication needs internet; logs and relief ratings save offline.
- The PDF covers the chosen range (30 days, 90 days or All).

## Roadmap

| Sprint | Deliverable | Status |
| ------ | ----------- | ------ |
| 0 | Approved proposal and project repository | ✅ Done |
| 1 | Splash, Welcome, About halo, Create Account, Log In, Forgot Password | ✅ Done |
| 2 | Log a Migraine (with voice note and Let Someone Know), offline sync, My Medications, relief ratings, History and Trends, PDF report for the doctor | ✅ Done |
| 3 | AI layer: treatment insights, Symptom Companion, preventative alerts | 🔄 Next |
| 4 | Harden and demo: security review, automated tests, accessibility | Planned |

**Future work:** scan a medication (box or barcode) to add it to My Medications.

BatWarriors LLC
