# halo-migraine-companion
Halo: AI-Powered Migraine Care Companion

<p align="center">
  <img src="assets/halo-logo.png" alt="Halo — Migraine Care Companion" width="360">
</p>

<h3 align="center">An AI-powered migraine care companion</h3>

<p align="center">
  Log a migraine in under a minute — by voice or by tap — and learn which treatments actually work for you.
</p>


---

## Project links

| | |
|---|---|
| 🎥 **Proposal video** | [Watch the proposal presentation on YouTube] https://youtu.be/Kb44Jap_8og |
| 💼 **LinkedIn post** | [Read the project announcement](LINKEDIN_POST_LINK) |


**Team:** BatWarriors LLC — Smita Krishnan, Sai Charan Beemara (Project Manager / Team Lead)
**Client:** Dr. V. Govindaswamy

---

## Contents

- [The problem](#the-problem)
- [What users of today's apps are telling us](#what-users-of-todays-apps-are-telling-us)
- [How Halo is different](#how-halo-is-different)
- [A day with Halo](#a-day-with-halo)
- [Roadmap](#roadmap)
- [Future work](#future-work)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [References](#references)

---

## The problem

- More than **40 million Americans** and about **1.2 billion people worldwide** live with migraine.
- It is the **second leading cause of disability** in the world, and there is **no cure** — only management.
- Doctors recommend keeping a headache diary, but popular apps make logging slow during an attack, ask whether a medication worked before you can know, and leave you to work out what's actually helping.

## What users of today's apps are telling us

We studied real App Store reviews of the three most popular migraine apps and color-coded the gaps.

| App | What users struggle with |
|---|---|
| **Migraine Buddy** | Hard to use and slow to fill in · asks if a treatment worked far too soon ("Nothing works that fast") · hard to see patterns · attacks fail to save · asks for personal information |
| **Bearable** | Time-consuming and confusing · tracks symptoms but doesn't help treat them · doesn't explain patterns · health data doesn't sync · feels invasive · key features need premium |
| **N1-Headache** | Painfully slow to type in · can't adjust medication doses · rigid limits and 90-day lockouts · no support or updates |

<details>
<summary>See the highlighted reviews</summary>

![Migraine Buddy reviews]"C:\Users\krish\Desktop\CUC\Advanced Software Engineering Capstone\Proposal Halo\halo-migraine-companion\docs\images\users-migraine-buddy.png"
![Bearable reviews] "C:\Users\krish\Desktop\CUC\Advanced Software Engineering Capstone\Proposal Halo\halo-migraine-companion\docs\images\users-bearable.png"
![N1-Headache reviews] "C:\Users\krish\Desktop\CUC\Advanced Software Engineering Capstone\Proposal Halo\halo-migraine-companion\docs\images\users-n1-headache.png"

</details>

## How Halo is different

| Feature | Migraine Buddy | Bearable | N1-Headache | **Halo** |
|---|:---:|:---:|:---:|:---:|
| Fast / voice logging | ❌ | Partial | ❌ | ✅ |
| Computed medication effectiveness | ❌ | ❌ | ❌ | ✅ |
| AI treatment insight (plain language) | ❌ | ❌ | ❌ | ✅ |
| AI symptom Q&A (grounded, advisory only) | ❌ | ❌ | ❌ | ✅ |
| Neurologist-ready report | ✅ | Partial | ✅ | ✅ |
| Preventative pattern alerts | Partial | ❌ | Partial | ✅ |
| Companion website | ✅ | ✅ | ✅ | Planned |

**Halo closes the loop from logging an attack to knowing what works:**

- ⚡ **Quick logging** — pain, side, symptoms, triggers, and medication on one screen, in under a minute.
- 🎙️ **Voice-assisted entry** — say "seven out of ten, right side, nausea" and the form fills itself.
- ⏱️ **Delayed relief rating** — relief is rated after the attack ends, so time-to-relief is measured, not guessed.
- 🧠 **AI treatment insight** — a plain-language answer to "what's actually working for me?"
- 💬 **Symptom Companion** — quick answers to questions like "is this a side effect?", grounded in medication reference data and always advisory, never diagnostic.
- ☁️ **Works offline** — logs save on the phone first, then sync to the cloud.

## A day with Halo

| Time | What happens |
|---|---|
| 9:14 AM | Maria feels an attack starting and says: "migraine, seven out of ten, right side, nausea." Logged in 12 seconds. |
| 9:16 AM | She logs the sumatriptan she took. Halo starts a timer — it doesn't ask her to rate it yet. |
| 11:40 AM | The attack ends. She rates her relief 8/10; Halo calculates a time-to-relief of 2 h 24 min. |
| 2 weeks later | Halo's AI insight shows sumatriptan resolves her attacks faster than her other medication. |
| That evening | She asks the Symptom Companion about a stiff neck; it answers from reference data and reminds her to tell her neurologist. |

## Roadmap

Five sprints, following Agile Scrum. Each sprint ends with a deliverable.

| Sprint | Focus | Deliverable | Status |
|---|---|---|---|
| **0** | Foundation — background, research, proposal | Approved proposal, backed by research | ✅ Complete |
| **1** | Core logging — Firebase + auth, login/signup screens, quick-log flow (< 60 s), voice-assisted entry, medication library, local + cloud sync | Accounts + attack and medication logging, online and offline | 🚧 In progress |
| **2** | Effectiveness + reports — delayed relief rating, time-to-relief, history and trends, PDF export | MVP locked: effectiveness, history, and PDF report | Planned |
| **3** | AI layer — Cloud Functions + LLM, treatment-insight engine, Symptom Companion, preventative alerts | AI insight, Symptom Companion, and alerts live | Planned |
| **4** | Harden + demo — security-rule audit, automated tests, accessibility, docs | Tested, accessible, demoable app + docs | Planned |

## Future work

- **Near-term:** a social circle notified when an attack is logged · a check-in timer during an active attack · a manual "Call 911" button for red-flag symptoms · a curated migraine news and research feed
- **Clinical integration:** real-time connection to a doctor (telehealth)
- **Emerging technology:** quantum computing (no role in Halo today; early research explores faster drug-response modeling)

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native with Expo, TypeScript — one codebase for iPhone and Android |
| Accounts | Firebase Authentication |
| Database | Cloud Firestore, with per-user security rules |
| Server & AI gateway | Firebase Cloud Functions (Node.js) — the only place the AI key is stored |
| AI | A pretrained large language model called through an API, grounded in curated medication reference data. No model is trained on user data. |
| Testing | Jest |
| Design | Figma |
| Build & deploy | Expo (EAS Build) |
| Source control | Git + GitHub |

## Repository structure

```
halo-migraine-companion/
├── README.md                        You are here
└── app/                             Mobile app source (added in Sprint 1)
```

## References

- GBD 2021 Headache Disorders Collaborators, "Global, regional, and national burden of headache disorders, 1990–2021, with forecasts to 2050," 2024.
- A. Stubberud et al., "Forecasting migraine with machine learning based on mobile phone diary and wearable data," *Cephalalgia*, vol. 43, no. 5, 2023.
- S. Lysk et al., "Engagement and predictors of use of a smartphone app for migraine self-management: A secondary analysis of the EMMA trial," *Headache*, vol. 66, 2026.
- L. Rabany et al., "Machine learning assessment of next-day migraine likelihood using data from 53,000 app users living with migraine," *Neurology Open Access*, vol. 2, no. 3, 2026.
- American Migraine Foundation, "Migraine Resources & Support," 2026.

## Disclaimer

Halo is in active development.

---

<p align="center">
  <a href="YOUTUBE_VIDEO_LINK">YouTube</a> ·
  <a href="LINKEDIN_POST_LINK">LinkedIn</a> ·
  <a href="https://github.com/skrishnan83/halo-migraine-companion">GitHub</a>
</p>
