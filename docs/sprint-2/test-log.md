# Sprint 2 test log

**Method:** manual tests on an iPhone (Expo Go) with a test account against the live Firebase project, with results checked in the Firebase console.
**Dates:** 10/29/2026 to 11/12/2026.

## Log a Migraine, voice, offline and My Medications

| # | What was tested | How | Expected | Actual | Result (date) |
|---|---|---|---|---|---|
| 1 | Severity required | Tapped "Save" with no severity | Message shown, nothing saved | "Please choose how severe it is." shown | Pass (10/29/2026) |
| 2 | Log a Migraine | Severity 6, 30 min ago, 2 symptoms, a note | "Home" opens; new card at the top | Saved; new card at the top of "Home" | Pass (10/29/2026) |
| 3 | Voice note | Tapped "Tap to speak", said a sentence, tapped to stop | Text appears in the "Note (optional)" box | Spoken words appeared in the "Note (optional)" box | Pass (10/29/2026) |
| 4 | Save offline | Airplane mode on, logged and saved | "Offline" status; card says "Waiting to sync" | "Offline" status; card says "Waiting to sync" | Pass (10/29/2026) |
| 5 | Sync when online | Airplane mode off, waited | "All synced"; log found in Firestore | "All synced" once Airplane mode was off | Pass (10/29/2026) |
| 6 | Medication name required | Tapped "Add Medication" with "Medication name" empty | "Please enter the medication's name." | "Please enter the medication's name." shown | Pass (10/29/2026) |
| 7 | Add medication | Sumatriptan, 50 mg | Appears in "Your list" | Diclofenac, Ibuprofen, Sumatriptan and Ubrelvy added | Pass (10/29/2026) |
| 8 | Remove medication | "Remove", then "Remove" to confirm | Removed from "Your list" | Asked "Remove medication?"; Ibuprofen removed | Pass (10/29/2026) |

## Relief, History and the PDF report

| # | What was tested | How | Expected | Actual | Result (date) |
|---|---|---|---|---|---|
| 9 | Rate relief | Tapped the severity 6 card ("Tap to Rate Relief"); Sumatriptan 100mg, A lot, 1 hour | Card shows the relief | "Relief: A lot · 1 hr · Sumatriptan 100mg" | Pass (10/29/2026) |
| 10 | Rate relief offline | Airplane mode on; rated the 4 card: Ubrelvy, A little, 2 hours | Saved; "Waiting to sync" | "Waiting to sync", then "All synced" when back online | Pass (10/29/2026) |
| 11 | Medications as choices | Opened "How Did It Go?" | "My Medications" listed | Diclofenac, Sumatriptan and Ubrelvy shown, plus "Nothing" | Pass (10/29/2026) |
| 12 | Time to relief | Chose "1 hour", then "2 hours" | "Time to relief: about …" | "about 1 hr" and "about 2 hr" shown | Pass (10/29/2026) |
| 13 | History and Trends | Opened "History", "30 days" | Tiles, weekly chart, "What helps" | 3 attacks, severity 4, 1 of 2, 1.5 hr; Sumatriptan "Works well" | Pass (10/29/2026) |
| 14 | Unrated attack | Looked at the severity 2 attack | Shown as not rated | "Not rated yet"; left out of "What helps" | Pass (10/29/2026) |
| 15 | PDF report | Tapped "Share PDF Report for My Doctor" | PDF made; share sheet opens | One-page PDF with summary, what helped and all 3 attacks | Pass (10/29/2026) |
| 16 | Share the report | Opened the PDF from the share sheet | Readable on the phone | Opened in the PDF viewer (1 of 1) | Pass (10/29/2026) |

## Severity labels and Let Someone Know

| # | What was tested | How | Expected | Actual | Result (date) |
|---|---|---|---|---|---|
| 17 | Severity labels | Opened "Log a Migraine" | "Mild" under 1 and "Extreme" under 10 | "Mild" and "Extreme" shown | Pass (11/12/2026) |
| 18 | Let Someone Know | Chose severity 8, tapped "Let Someone Know", picked a contact in Messages | Red "This is a severe attack" box; share sheet opens with the message | Box shown; share sheet opened; "I'm having a severe migraine (8/10) and may need help. Could you check on me? (sent from halo)" delivered | Pass (11/12/2026) |

## Bugs found and fixed

- Expo Go moved to SDK 58, so the project was upgraded (expo-doctor: 20/20 checks).
- After the upgrade, two type errors in "Log a Migraine" (ScrollView) were fixed.
- "Create Account" opened "Home": it now signs out and opens "Log In".
