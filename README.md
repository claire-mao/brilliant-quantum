# Brilliant Quantum

A learn-by-doing web app that teaches quantum computing fundamentals to beginners
through short, interactive lessons. The MVP teaches **qubits and superposition** with a
hands-on probability slider, instant feedback, and saved progress.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Firebase Auth, and Firestore.

## Features (MVP)

- Email/password sign up, log in, log out with a display name.
- "Quantum Basics" course with Lesson 1 ("Qubits & Superposition") and a locked
  "Measurement" lesson.
- Interactive slider challenge: set the qubit's probability of measuring 1, with a live
  probability visual and instant handwritten feedback (±5% tolerance).
- Progress persistence: current step and completion are saved to Firestore so learners
  can leave and return.
- "Quantum Beginner" badge and streak after completing Lesson 1, plus a next-step
  recommendation.
- Mobile responsive and touch-friendly.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Firebase project at https://console.firebase.google.com, then:
   - Enable **Authentication > Sign-in method > Email/Password**.
   - Create a **Firestore** database.
   - Copy your web app config from **Project settings > General > Your apps**.

3. Fill in `.env.local` with your real Firebase values (placeholders are committed locally
   so the app builds, but auth only works with real keys):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

4. Deploy the Firestore security rules in [`firestore.rules`](firestore.rules) (each user
   can only read/write their own `users/{uid}` document):

   ```bash
   npx -y firebase-tools@latest deploy --only firestore:rules
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Project structure

```
app/
  layout.tsx                  # wraps the app in <AuthProvider>
  page.tsx                    # landing page (redirects signed-in users to /dashboard)
  login/ , signup/            # auth pages
  dashboard/                  # course path
  lessons/[lessonId]/         # lesson player
lib/
  firebase.ts                 # Firebase init (auth + db)
  auth-context.tsx            # AuthProvider + useAuth()
  progress.ts                 # Firestore read/write helpers
  types.ts                    # shared types
content/lessons.ts            # course + lesson content (data, not hardcoded JSX)
components/                   # AuthForm, RouteGuard, NavBar, QubitSlider,
                              # ProbabilityVisual, LessonStepRenderer, Badge
firestore.rules               # Firestore security rules
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into Vercel (the Next.js framework is auto-detected).
3. Add the six `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel project
   settings.
4. In the Firebase console, add your Vercel domain under
   **Authentication > Settings > Authorized domains**.
5. Deploy, then verify sign up -> Lesson 1 -> refresh persistence on the live URL.
