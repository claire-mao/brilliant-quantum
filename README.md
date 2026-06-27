# Brilliant Quantum

**Subject: Quantum Computing Fundamentals**

Brilliant Quantum is a learn-by-doing web app that teaches introductory quantum computing through short, interactive lessons instead of videos or long readings. Across six units, learners build intuition for qubits, superposition, measurement, gates, circuits, interference, entanglement, algorithms, and hardware by manipulating live visualizations, predicting outcomes, and getting immediate feedback. A learning-science engine and an AI "wizard" companion adapt practice and hints to each learner — no advanced mathematics required.

- **Live app:** _<add your deployed URL here, e.g. https://brilliant-quantum.vercel.app>_
- **Demo account:** _<email>_ / _<password>_ _(replace with a real demo login, or sign up)_

## Tech stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase Authentication** (email/password + Google)
- **Cloud Firestore** (progress persistence)
- **OpenAI API** (server-side AI hints, practice, and fun facts)
- **KaTeX** (math typesetting via `react-katex`)
- **Vercel** (deployment)

## Features

- **Interactive quantum lessons** — six units of bite-sized lessons taught through reusable, configurable visualizations and simulators (Bloch sphere, gate labs, circuit builders, amplitude/interference explorers, two-qubit and entanglement tools, search/oracle/period-finding, hardware comparisons, and more), built with React and inline SVG.
- **Progress persistence** — current step, completion, attempts, and streaks are saved per user in Cloud Firestore, so learners can leave and resume exactly where they left off.
- **AI wizard companion** — a floating Guide Wizard offers **hints**, **practice questions**, and **fun facts** through server-side OpenAI calls. All AI is additive and degrades gracefully: if the key is missing or a request fails, handwritten fallbacks keep every lesson fully usable with AI turned off.
- **Tower practice game** — the Wizard Tower (`/tower`) is a retrieval-practice arena where learners battle concept "monsters" with quick recall questions.
- **Learning science engine** — a lightweight, client-side learner model tracks per-concept signals and drives **retrieval practice**, **spaced review**, **progressive (leveled) hints**, **worked examples**, prerequisite reminders, and **mastery** language. See [`LEARNING_SCIENCE.md`](./LEARNING_SCIENCE.md).
- **Achievements, profile, and avatar customization** — an achievements catalog (learning, consistency, challenge, and secret categories) with a badge-unlock ceremony, plus a profile page with stats and a customizable pixel-wizard avatar (colors, wand, aura, familiar).
- **Mobile responsiveness** — layouts, sliders, and visualizations are touch-friendly and adapt from phone to desktop; all animations honor `prefers-reduced-motion`.

## Learning philosophy

Each concept is taught through a short interaction loop:

1. **Predict** — commit to a hypothesis before acting.
2. **Interact** — manipulate a live model (a slider, a gate, a circuit).
3. **Observe** — see what actually happens.
4. **Explain** — read concise, concept-specific feedback that explains why.

Wrong answers surface the underlying misconception rather than a bare "incorrect," and graded steps require the correct answer before advancing. The learning-science engine then schedules retrieval and review so understanding sticks.

## Project structure

```text
brilliant-quantum/
├── app/                 # App Router routes, layouts, global styles
│   ├── api/ai/          # Server-only AI routes: hint, practice, fun-fact
│   ├── dashboard/       # Course path, progress grimoire, tower entry
│   ├── lessons/         # Lesson player (dynamic [lessonId] route)
│   ├── tower/           # Wizard Tower practice arena
│   ├── profile/         # Profile + avatar customization
│   ├── login/ signup/   # Auth pages
│   └── layout.tsx       # Root layout, providers, companion mount
├── components/          # UI + interactive lesson-step components, wizard companion, dashboard, achievements
├── content/lessons.ts   # All units, lessons, steps, prompts, and feedback as typed data
├── lib/                 # Core logic
│   ├── firebase.ts        # Firebase app, Auth, Firestore init
│   ├── auth-context.tsx   # Auth provider + useAuth()
│   ├── progress.ts        # Firestore profile/progress reads & writes
│   ├── ai/                # Server-only AI client, prompts, validators
│   ├── learning/          # Concept taxonomy, signals, learner model, retrieval bank
│   ├── companions/        # Floating companion types, anchors, physics
│   ├── achievements/      # Achievement catalog + evaluation
│   └── profile/           # Avatar config + activity/streak helpers
└── firestore.rules      # Firestore security rules
```

Lessons are structured, typed data rendered by a shared step renderer, so new lessons and step types can be added without touching routing or progress logic.

## Setup

```bash
npm install
```

Create a `.env.local` file in the project root with the following variables.

**Firebase (client config — public by design, from Firebase Console → Project settings → Your apps → SDK setup and configuration):**

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**OpenAI (server-only — required for AI features):**

```text
OPENAI_API_KEY=
# Optional overrides:
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini
```

In the Firebase Console: enable **Authentication → Email/Password** (and **Google** if you want Google sign-in), create a **Cloud Firestore** database, and deploy the rules in `firestore.rules` (each user can read/write only their own document).

Then run:

```bash
npm run dev     # Start the dev server at http://localhost:3000
npm run lint    # Run ESLint
npm run build   # Production build
```

The app works without `OPENAI_API_KEY` — AI features simply fall back to handwritten content.

## Deployment

Deployed on **Vercel**:

1. Push the repo to GitHub and import it into Vercel (Next.js is detected automatically — no extra build config needed).
2. Add all environment variables in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development:
   - the six `NEXT_PUBLIC_FIREBASE_*` values
   - `OPENAI_API_KEY` (plus optional `OPENAI_BASE_URL` / `OPENAI_MODEL`)
   - Because the `NEXT_PUBLIC_` Firebase vars are inlined at build time, they must exist **before** the build runs.
3. Deploy from GitHub (push to the production branch, or click **Deploy**).
4. Add the Vercel domain to **Firebase Authentication → Settings → Authorized domains**, or sign-in will be rejected on the deployed site.

## Security

- **Never commit `.env.local`** (or any real keys). It is already covered by `.gitignore` (`.env*`).
- **`OPENAI_API_KEY` must stay server-side — do NOT prefix it with `NEXT_PUBLIC_`.** It is read only inside `app/api/ai/*` routes via `lib/ai/client.ts`, so the key is never shipped to the browser. The `NEXT_PUBLIC_FIREBASE_*` values are safe to expose (they're client config and protected by Firestore security rules).
