# Brilliant Quantum

Brilliant Quantum is a learn-by-doing web application that teaches introductory quantum computing through short, interactive lessons rather than videos or long readings. Learners build intuition for qubits, superposition, measurement, gates, circuits, and interference by manipulating live visualizations, predicting outcomes, and getting immediate feedback — no advanced mathematics required.

**Tech stack**

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase Authentication**
- **Cloud Firestore**
- **Vercel** (deployment)

## Features

- **User authentication** — sign up, log in, and log out with email and password (Firebase Auth), including clear, handwritten error messages.
- **Persistent learning progress** — current step, completion, attempts, and streaks are saved per user in Cloud Firestore, so learners can leave and return.
- **Interactive Lesson 1: Qubits & Superposition** — the flagship lesson, with additional lessons (Measurement, Quantum Gates, Quantum Circuits, and Interference) that unlock sequentially.
- **Interactive visualizations and simulations** — probability bars, measurement and collapse demos, repeated-measurement histograms, gate and circuit builders, and wave/amplitude interference experiments, built with React and SVG (no charting libraries).
- **Immediate handwritten feedback** — every answer and interaction has manually written, concept-specific feedback; there are no AI-generated explanations.
- **Prediction-based questions** — learners commit to a prediction before revealing the outcome.
- **Progress tracking** — a dashboard shows lesson status (locked, in progress, completed), a streak counter, and earned badges.
- **Lesson completion badges** — each lesson awards a badge on completion.
- **Mobile responsive** — layouts, sliders, and visualizations are touch-friendly and adapt from phone to desktop widths.
- **Public deployment on Vercel.**

## Learning Philosophy

Brilliant Quantum follows a learn-by-doing approach inspired by [Brilliant.org](https://brilliant.org). Each concept is taught through a short interaction loop:

1. **Predict** — commit to a hypothesis before acting.
2. **Interact** — manipulate a live model (a slider, a gate, a circuit).
3. **Observe** — see what actually happens.
4. **Explain** — read concise feedback that explains why.

The goal is conceptual understanding over memorization. Wrong answers are met with explanations of the misconception rather than a simple "incorrect," and graded steps require the correct answer before advancing.

## Project Structure

```text
brilliant-quantum/
├── app/            # Next.js App Router routes, layouts, and global styles
│   ├── dashboard/  # Course path: lessons, status, streak, badges
│   ├── lessons/    # Lesson player (dynamic [lessonId] route)
│   ├── login/      # Log-in page
│   ├── signup/     # Sign-up page
│   ├── layout.tsx  # Root layout and AuthProvider
│   └── page.tsx    # Landing page
├── components/     # UI and interactive lesson-step components
│                   # (visualizers, simulators, builders, step renderer, auth form, nav)
├── content/        # Structured lesson content
│   └── lessons.ts  # Lessons, steps, prompts, and feedback as typed data
├── lib/            # Core logic
│   ├── firebase.ts      # Firebase app, Auth, and Firestore initialization
│   ├── auth-context.tsx # Auth provider and useAuth() hook
│   ├── progress.ts      # Firestore reads/writes for profiles and progress
│   └── types.ts         # Shared TypeScript types
├── public/         # Static assets
└── firestore.rules # Firestore security rules
```

Lessons are defined as structured, typed data in `content/lessons.ts` and rendered by a shared step renderer in `components/`, so new lessons and step types can be added without changing routing or progress logic.

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Firebase configuration

A `.env.local` file with your Firebase web app configuration is required. Create one in the project root with the following variables (values come from the Firebase Console under **Project settings → General → Your apps → SDK setup and configuration**):

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> `.env.local` is gitignored and should never be committed. The values above are left blank intentionally — do not commit real keys.

In the Firebase Console, enable **Authentication → Email/Password**, create a **Cloud Firestore** database, and deploy the security rules in `firestore.rules` (each user can read and write only their own document).

### Useful scripts

```bash
npm run dev     # Start the development server
npm run build   # Production build
npm run start   # Serve the production build
npm run lint    # Run ESLint
```

## Deployment

The project is deployed on **Vercel**. The framework is detected automatically (Next.js), so no extra build configuration is required.

The same Firebase environment variables used locally must be configured in the **Vercel dashboard** (Project → Settings → Environment Variables) for the Production, Preview, and Development environments. Because these are `NEXT_PUBLIC_` variables, they are inlined at build time and must exist **before** the build runs, or the build will fail during prerendering.

After deploying, add the Vercel domain to **Firebase Authentication → Settings → Authorized domains**. Without this, sign-up and log-in will be rejected on the deployed site.
