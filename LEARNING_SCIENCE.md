# Learning Science Engine

Brilliant Quantum is built around one coherent learning model. Every part of the
app plays a distinct role:

- **The lesson teaches.** Hand-built, interactive lessons are the source of truth.
- **The wizard guides.** The Guide Wizard never lectures; it helps you retrieve,
  connect, and refine what you already know.
- **The tower gives retrieval practice.** The Tower Arena is targeted recall, not
  random trivia.
- **The app adapts.** It tracks what you have shown you know and steers practice
  and review accordingly.

AI is strictly **additive**. With `OPENAI_API_KEY` unset, every feature still
works using hand-written fallbacks.

## Principles encoded

1. Learning is a durable change in long-term memory.
2. Working memory is limited → short, focused guidance.
3. Prior knowledge predicts future learning → prerequisite reminders.
4. Retrieval beats rereading → between-lesson recall + the tower.
5. Spacing beats cramming → a per-concept review schedule.
6. Explicit instruction for novices → the lesson leads; the wizard only offers gentle prompts.
7. Worked examples accelerate learning → `worked-example` steps.
8. Feedback should be timely and actionable → immediate, specific feedback.
9. Knowledge enables critical thinking → mastery is built on correct reasoning.
10. Motivation follows competence → mastery language and celebration of effort.

## The learner model (`lib/learning/`)

- `concepts.ts` — the concept taxonomy (qubits, measurement, superposition,
  Bloch sphere, phase, gates, interference, entanglement, algorithms, hardware),
  the lesson→concept map, prerequisites, and recall reminders. **Pure data.**
- `signals.ts` — client-only learning signals in `localStorage`: per-concept
  correct/wrong counts, hint usage, repeated misconceptions, and a lightweight
  spaced-review schedule. **No Firestore schema change.**
- `retrieval.ts` — a hand-written retrieval-practice bank (one accurate question
  per concept) so retrieval works fully offline / AI-off.
- `learner-model.ts` — derived helpers:
  - `getLearnerConceptProfile()` — mastery status per concept.
  - `getMisconceptionSignals()` — repeated wrong-answer patterns.
  - `getRecommendedReview()` — what to revisit (struggled → due → stale).
  - `getNextRetrievalPrompt()` — the next recall question to surface.
  - `getPrerequisiteReminder()` — prior-knowledge activation for a lesson.
  - `getConceptNeed()` — concept + misconception used to ground AI practice.

## How retrieval practice works

- **Before a lesson:** a prerequisite reminder activates prior knowledge, with an
  optional one-question "warm-up recall" (`PrerequisiteReminder`).
- **After a lesson:** a "Can you still remember?" question is drawn from an older
  or struggled concept (`RetrievalPrompt` on the completion screen).
- **In the tower:** each encounter is a retrieval question for a prioritized
  concept.

Answering any retrieval question records a signal and reschedules review. It
never gates lesson progress.

## How hints are scaffolded

Hints are progressive and never reveal the answer until support is exhausted.
The level escalates with each wrong attempt (`lib/ai/prompts.ts` →
`hintPrompt(level)`, surfaced by `WizardHelpPrompt` and the tower):

- **Level 1 — Retrieval cue:** "What did the previous experiment show?"
- **Level 2 — Attention cue:** "Look at what changed after applying H."
- **Level 3 — Concept cue:** names the underlying idea.
- **Level 4 — Short explanation:** only after repeated misses; walks the
  reasoning but still leaves the final step to the learner.

Each level has a hand-written fallback so scaffolding works with AI disabled.

## How spaced review works

`signals.ts` keeps a per-concept `dueAt` / `intervalDays`:

- Wrong → interval resets to 1 day (review soon).
- Correct → interval doubles (capped at 21 days; review later).
- Not seen recently → surfaced as "stale" for review.

`getRecommendedReview()` orders concepts **struggled → due → stale**, which is the
exact priority the Tower Arena uses to pick encounters. The structure is
deliberately simple so it can grow into a fuller spaced-repetition scheduler.

## How the tower supports review

The Tower Arena (`components/tower/TowerArena.tsx`) is the retrieval arena:

1. Builds a battle plan from `getRecommendedReview()` (struggled first, due
   second, current lesson third, then the rest).
2. Each concept manifests as a themed monster (Phase Phantom = relative phase,
   Noise Gremlin = decoherence, Gate Golem = gate sequences, Oracle Mimic =
   algorithms, Concept Wraith = a generic fragile concept).
3. Asks a question (AI practice grounded in the concept, or the retrieval bank).
4. Gives immediate feedback; wrong answers offer progressive guide hints.
5. Correct answers damage the monster and **strengthen the mastery signal**.
6. Victory shows a one-sentence reflection and an optional lore drop.

## How AI is grounded in lesson state

- **Hints** receive the lesson/concept, the chosen wrong answer, and the level —
  never used to dump answers.
- **Practice** targets exactly one concept and is told the prerequisite and the
  learner's likely misconception (so a distractor reflects it). Output is
  validated (`lib/ai/validators.ts`) before display; invalid output falls back to
  the hand-written bank.
- **System prompt** (`GUIDE_SYSTEM`) instructs the wizard to identify the
  misconception, recall the prerequisite, ask one guiding question, give one
  small hint, and only explain if the learner remains stuck.

## Why the wizard is a guide, not the teacher

The lesson is carefully sequenced instruction. A chatty AI tutor would (a) risk
inaccuracy, (b) encourage passive rereading over retrieval, and (c) make learning
depend on the network. So the wizard is intentionally constrained to guidance —
retrieval cues, attention cues, encouragement — and the course remains fully
functional with AI turned off.

## Mastery language

Completion alone is **not** mastery. `getLearnerConceptProfile()` derives a status
per concept:

- **Introduced** — seen but not yet completed.
- **Practiced** — at least one lesson completed.
- **Strengthening** — completed with some correct retrieval, still consolidating.
- **Mastered** — all lessons for the concept completed, a successful retrieval on
  record, no recent struggle, and nothing due for review.

This status is shown in the dashboard progress panel.
