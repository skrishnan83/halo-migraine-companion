# Sprint 1 test log

**Method:** manual tests on an iPhone (Expo Go) against the live Firebase project, with results checked in the Firebase console.
**Dates:** 10/12/2026 to 10/29/2026.

| # | What was tested | How | Expected | Actual | Result (date) |
|---|---|---|---|---|---|
| 1 | Log In with wrong details | Typed an unregistered email and a password | Error message, stays on Log In | "Email or password is incorrect." shown | Pass (10/12/2026) |
| 2 | 3 failed log ins | Wrong password three times in a row | Opens Forgot Password | Attempt 1 of 3, Attempt 2 of 3, then an alert and Reset your password | Pass (10/29/2026) |
| 3 | Create Account | New email and a 15+ character password | Opens Log In (never Home); user in Firebase | "Account created", then Log In; log in opened Home | Pass (10/29/2026) |
| 4 | Weak password blocked | 5 passwords, each missing one rule | Not created; the checklist shows what is missing | | To test |
| 5 | Strong password accepted | New email and a password meeting all five rules | Account created, user in Firebase | All five rules ticked; account created | Pass (10/29/2026) |
| 6 | Stay logged in | Closed the app fully and reopened it | Opens Home without logging in | Opened straight to Home | Pass (10/12/2026) |
| 7 | User profile saved | Checked the Firestore console | Profile with email, role and date | Document found with all three fields | Pass (10/12/2026) |
| 8 | Forgot Password | Entered email, Send Reset Link, opened the email | Reset email arrives; the new password works | Link opened, password changed, logged in | Pass (10/29/2026) |
| 9 | Welcome and About halo | Opened the app, About halo, Back, Log Out | Splash, Welcome, About opens and returns | Worked as expected | Pass (10/12/2026) |

## Bugs found and fixed

- No defects were found in Create Account, Log In or Forgot Password.
- The Firestore console showed "Error loading documents" when checking a saved profile. The data was saved, and refreshing the page fixed the display.
