# halo: Sprint 2 report

**Sprint goal:** make halo useful during and after an attack: log a migraine in a few taps or by voice, save offline, keep a medication list, rate relief, see trends, and share a report with the doctor.
**Result:** every planned item was built, run on a real iPhone and tested (18 tests, all passed).

**Video:** Sprint 2 on YouTube: https://youtu.be/BMcQFon5g9g

**LinkedIn:** Sprint 2 on LinkedIn: SPRINT2_LINKEDIN_LINK

Contents:
1. [Deliverables](#1-deliverables)
2. [Comparison chart: implemented vs planned](#2-comparison-chart-implemented-vs-planned)
3. [UI designs](#3-ui-designs)
4. [Implementation and testing](#4-implementation-and-testing)
5. [Feedback decision log](#5-feedback-decision-log)
6. [Agile Scrum review](#6-agile-scrum-review)

---

## 1. Deliverables

| Required for Sprint 2 | Status |
|---|---|
| Log a Migraine (quick log), with a note by voice | ✅ Done |
| Offline saving, synced when online | ✅ Done |
| My Medications | ✅ Done |
| Rate relief after an attack ("How Did It Go?") | ✅ Done |
| History and Trends | ✅ Done |
| PDF report for the doctor | ✅ Done |

| Extra work completed | Status |
|---|---|
| Home shows recent attacks and the sync status | ✅ Done |
| Severity labels: 1 "Mild" and 10 "Extreme" | ✅ Done |
| "Let Someone Know" at severity 8 to 10 (opens the share sheet to text family or a friend) | ✅ Done |
| Sprint 1 backlog: new logo, Create Account opens Log In, 3 log in attempts | ✅ Done |
| Project upgraded to Expo SDK 58 | ✅ Done |

## 2. Comparison chart: implemented vs planned

Partial = present in a limited or paid-only form.

| Feature | Migraine Buddy | Bearable | N1-Headache | halo |
|---|---|---|---|---|
| Voice logging | ❌ | Partial | ❌ | ✅ Implemented |
| Relief rated after the attack ends | ❌ | ❌ | ❌ | ✅ Implemented |
| Report for the neurologist | ❌ | ❌ | ❌ | ✅ Implemented |
| AI treatment insight | ❌ | ❌ | ❌ | 🔄 Sprint 3 |
| Symptom question companion | ✅ | Partial | ✅ | 🔄 Sprint 3 |
| Preventative pattern alerts | Partial | ❌ | Partial | 🔄 Sprint 3 |
| Companion website | ✅ | ✅ | ✅ | Planned |

## 3. UI designs

Each Sprint 2 screen, drawn in the app's own colours (the numbers mark what can be tapped): [`ui/screens`](ui/screens)

| Screen | Design |
|---|---|
| Home | [S2-01_Home.png](ui/screens/S2-01_Home.png) |
| Log a Migraine | [S2-02_Log_a_Migraine.png](ui/screens/S2-02_Log_a_Migraine.png) |
| Voice note | [S2-03_Voice_note.png](ui/screens/S2-03_Voice_note.png) |
| Severe attack: Let Someone Know | [S2-04_Severe_attack_Let_Someone_Know.png](ui/screens/S2-04_Severe_attack_Let_Someone_Know.png) |
| My Medications | [S2-05_My_Medications.png](ui/screens/S2-05_My_Medications.png) |
| Remove medication | [S2-06_Remove_medication.png](ui/screens/S2-06_Remove_medication.png) |
| How Did It Go? | [S2-07_How_Did_It_Go.png](ui/screens/S2-07_How_Did_It_Go.png) |
| History and Trends | [S2-08_History_and_Trends.png](ui/screens/S2-08_History_and_Trends.png) |
| History: share report | [S2-09_History_share_report.png](ui/screens/S2-09_History_share_report.png) |
| PDF report (share sheet) | [S2-10_PDF_report_share_sheet.png](ui/screens/S2-10_PDF_report_share_sheet.png) |

## 4. Implementation and testing

| Requirement | Design | Screen | Implementation | Test result |
|---|---|---|---|---|
| Log a Migraine | Log a Migraine sequence, Home HTA, FSM Level 1 | "Log a Migraine" | Saved on the phone first, then Cloud Firestore | Pass (10/29/2026) |
| Add a note by voice | Voice Note sequence | "Log a Migraine" ("Tap to speak") | Phone recording, speech-to-text service | Pass (10/29/2026) |
| Offline save and sync | Offline Save and Sync sequence, data flow | "Home" ("Offline" / "Waiting to sync") | Waiting list on the phone, uploads when online | Pass (10/29/2026) |
| My Medications | My Medications sequence, use case | "My Medications" | Cloud Firestore list per user | Pass (10/29/2026) |
| Rate relief | Rate Relief sequence, Home HTA, FSM Level 0 | "How Did It Go?" | Saved on the phone first, then Cloud Firestore | Pass (10/29/2026) |
| History and Trends | History and PDF Report sequence, use case | "History and Trends" | Trends worked out on the phone from your attacks | Pass (10/29/2026) |
| PDF report | History and PDF Report sequence, data flow | "Share PDF Report for My Doctor" | expo-print makes the PDF; expo-sharing opens the share sheet | Pass (10/29/2026) |
| Let Someone Know | Use case, FSM Level 1 Log a Migraine | "Log a Migraine" (severity 8 to 10) | React Native Share opens the share sheet with a ready-made message | Pass (11/12/2026) |

The full test log is in [test-log.md](test-log.md).

## 5. Feedback decision log

The decision for every review comment is in [feedback-log.md](feedback-log.md).

## 6. Agile Scrum review

**Problems encountered**
- Expo Go moved to SDK 58 during the sprint, so the project had to be upgraded (expo-doctor: 20/20 checks).
- Stricter type checks in the new React Native version caught two type errors in "Log a Migraine", which were fixed.
- The microphone must be allowed for Expo Go in the phone's Settings before voice notes work.

**Changes made after feedback**
- New logo in the app and on every slide; "halo" in lowercase everywhere.
- "Create Account" now opens "Log In"; the 3rd failed log in opens "Forgot Password".
- Severity shows 1 "Mild" and 10 "Extreme", and 8 to 10 shows "Let Someone Know".
- All diagrams use the app's own words and function names, and every test result has a date.

**Known issues and remaining work**
- Voice notes need internet, because the speech-to-text service is online.
- Adding or removing a medication needs internet; logs and relief ratings save offline.
- The PDF covers the chosen range (30 days, 90 days or All).
- Future work: scan a medication (box or barcode) to add it to "My Medications".
- No automated tests yet (planned for Sprint 4).
