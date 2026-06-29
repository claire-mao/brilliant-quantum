# Brilliant Quantum

**Subject: Quantum Computing Fundamentals**

Brilliant Quantum is a learn-by-doing web app that teaches introductory quantum computing through short, interactive lessons instead of videos or long readings. Across six units, learners build intuition for qubits, superposition, measurement, gates, circuits, interference, entanglement, algorithms, and hardware by manipulating live visualizations, predicting outcomes, and getting immediate feedback. A learning-science engine and an AI “wizard” companion adapt practice and hints to each learner — no advanced mathematics required.

## Tech stack

| Layer | Technology |
| --- | --- |
| App framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Cloud Firestore (user progress, profile, streaks) |
| AI | OpenAI API (server-side hints, practice, fun facts) |
| Math | KaTeX via `react-katex` |
| Hosting | Vercel (recommended) |
| Tests | Vitest (pure lesson / learning / tower logic) |

## Features

- **Interactive quantum lessons** — six units of bite-sized lessons taught through reusable, configurable visualizations and simulators (Bloch sphere, gate labs, circuit builders, amplitude/interference explorers, two-qubit and entanglement tools, search/oracle/period-finding, hardware comparisons, and more), built with React and inline SVG.
- **Progress persistence** — current step, completion, attempts, and streaks are saved per user in Cloud Firestore, so learners can leave and resume exactly where they left off.
- **AI wizard companion** — a floating Guide Wizard offers **hints**, **practice questions**, and **fun facts** through server-side OpenAI calls. All AI is additive and degrades gracefully: if the key is missing or a request fails, handwritten fallbacks keep every lesson fully usable with AI turned off.
- **Wizard Tower** (`/tower`) — a 60-floor pixel retrieval dungeon across six unit climates (rooms, bosses, and progressive feedback). Battles adapt to the learner model (retrieval practice, spaced review, interleaving, leveled hints, misconception correction), unlock as course units complete, award tower badges, and persist locally — inline SVG/CSS art with optional battle music and sound.
- **Learning science engine** — a lightweight, client-side learner model tracks per-concept signals and drives **retrieval practice**, **spaced review**, **progressive (leveled) hints**, **worked examples**, prerequisite reminders, and **mastery** language. See [`LEARNING_SCIENCE.md`](./LEARNING_SCIENCE.md).
- **Achievements & avatar** — badge unlock ceremonies, profile stats, and a customizable pixel-wizard avatar.
- **Mobile-first layouts** — responsive Tailwind, 44px touch targets on primary controls, horizontal overflow clipped, safe-area padding on floating controls; animations honor `prefers-reduced-motion`.

## Architecture

```mermaid
flowchart TB
  subgraph Client["Next.js client (App Router)"]
    Pages["Routes: /dashboard, /lessons, /tower, /profile"]
    Renderer["LessonStepRenderer + simulators"]
    Companion["CompanionProvider + Guide Wizard"]
    LearnerUI["Dashboard grimoire + MemoryGrimoire"]
  end

  subgraph Content["Typed lesson content"]
    Lessons["content/lessons.ts"]
  end

  subgraph Local["Browser-local (no schema change)"]
    Signals["lib/learning/signals.ts"]
    TowerStore["lib/tower/progression.ts"]
  end

  subgraph Server["Next.js server routes"]
    Hint["/api/ai/hint"]
    Practice["/api/ai/practice"]
    FunFact["/api/ai/fun-fact"]
  end

  subgraph Firebase["Firebase"]
    Auth["Authentication"]
    Firestore["Firestore user docs"]
  end

  subgraph Learning["Learning engine (derived)"]
    Model["lib/learning/learner-model.ts"]
    Feedback["lib/learning/progressive-feedback.ts"]
    Retrieval["lib/learning/retrieval.ts"]
  end

  subgraph Tower["Wizard Tower"]
    FloorPlan["lib/tower/floor-plan.ts"]
    Battle["lib/tower/battle.ts + TowerArena"]
  end

  Pages --> Renderer
  Pages --> Companion
  Pages --> LearnerUI
  Renderer --> Lessons
  LearnerUI --> Model
  Model --> Signals
  Model --> Lessons
  Feedback --> Renderer
  Feedback --> Battle
  TowerStore --> Battle
  FloorPlan --> Battle
  Battle --> Model
  Battle --> Practice
  Companion --> Hint
  Companion --> FunFact
  Pages --> Auth
  Pages --> Firestore
  Hint --> OpenAI[(OpenAI API)]
  Practice --> OpenAI
  FunFact --> OpenAI
```

**Data flow in brief:** lesson content lives in typed TS data; Firestore stores durable progress; localStorage holds learning signals and Tower cursor; the learner model is derived from both. AI routes never expose keys to the browser.

## Project structure

```text
brilliant-quantum/
├── app/                      # App Router routes, layouts, global styles
│   ├── api/ai/               # Server-only AI: hint, practice, fun-fact
│   ├── dashboard/            # Course path, grimoire, tower entry
│   ├── lessons/[lessonId]/   # Lesson player
│   ├── tower/                # Wizard Tower arena
│   ├── profile/              # Profile + avatar
│   ├── login/ signup/        # Auth pages
│   └── layout.tsx            # Root layout, providers, companion mount
├── components/               # UI, simulators, companions, dashboard, tower
│   ├── companions/           # Floating wizard system (provider, drag, speech)
│   ├── dashboard/            # Progress panel, tower card, unit sigils
│   ├── tower/                # TowerArena, challenges, floor map, transitions
│   └── LessonStepRenderer.tsx
├── content/lessons.ts        # All units, lessons, steps, prompts, feedback
├── hooks/                    # Shared React hooks (e.g. useReducedMotion)
├── lib/
│   ├── firebase.ts           # Firebase app, Auth, Firestore init
│   ├── auth-context.tsx      # Auth provider + useAuth()
│   ├── progress.ts           # Firestore profile/progress reads & writes
│   ├── ai/                   # Server-only AI client, prompts, validators
│   ├── learning/             # Concepts, signals, learner model, retrieval
│   ├── companions/           # Companion types, anchors, messages, physics
│   ├── tower/                # Floor plan, progression, battle, challenges
│   ├── achievements/         # Achievement catalog + evaluation
│   ├── profile/              # Avatar config + activity/streak helpers
│   └── utils/                # Small shared helpers (clamp, etc.)
├── scripts/verify-tower-bank.ts
└── firestore.rules           # Firestore security rules
```

**Module boundaries:** `content/lessons.ts` is the single source of pedagogical structure; `lib/learning/*` derives scheduling and feedback without changing Firestore schema; `lib/tower/*` owns Tower pure logic and local persistence; `components/*` renders and wires user interaction; `app/api/ai/*` is the only place OpenAI keys are read.


## Wizard Tower overview

| Floor | Theme | Unlock |
| --- | --- | --- |
| 1–6 | Unit review (3 chambers each) | Complete matching course unit |
| 7 | Mixed retrieval vs Eve (boss) | Clear floors 1–6 **or** finish all units |

Tower progress (`floor`, cleared chambers, boss seed) persists in `localStorage` under `bq-tower-progress-v2`. Concept selection interleaves current-unit, prior-unit, and weak/due review tags using the learner model.

## Lessons overview

Six units, ~30 interactive lessons total, each built from typed `LessonStep` data rendered by `LessonStepRenderer`. Steps include predictions, simulators, circuit builders, worked examples, and graded challenges. Unlock order is linear within the course; completed lessons stay reachable.
