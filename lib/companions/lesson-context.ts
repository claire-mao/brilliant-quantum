import type { Lesson, LessonStep } from "@/lib/types";
import { CONCEPT_LABEL, primaryConcept, type ConceptTag } from "@/lib/learning/concepts";

/**
 * Client-side snapshot of what the learner is looking at right now, published by
 * the lesson page and read by the wizard when Hint / Practice / Fun fact is
 * clicked. Kept in module state (not React) so summon handlers can read it
 * synchronously from any component.
 */
export interface ActiveLessonContext {
  lessonId: string;
  lessonTitle: string;
  stepId: string;
  stepIndex: number;
  stepCount: number;
  stepTitle: string;
  stepType: string;
  conceptTag: ConceptTag | null;
  concept: string;
  /** Exact question shown on screen, when the step asks one. */
  question?: string;
  choices?: string[];
  /** Short excerpt of the step's explanatory text (no question). */
  stepSummary?: string;
}

export interface QuestionAttemptState {
  studentAnswer: string | null;
  incorrectAttempts: number;
  /** Feedback text for the most recent wrong choice, if any. */
  lastFeedback?: string;
}

let active: ActiveLessonContext | null = null;
const attempts = new Map<string, QuestionAttemptState>();

function questionKey(lessonId: string, question: string): string {
  return `${lessonId}::${question}`;
}

function excerpt(text: string | undefined, max = 360): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** Pull question / choices / explanation out of any lesson step shape. */
function describeStep(
  step: LessonStep
): Pick<ActiveLessonContext, "question" | "choices" | "stepSummary"> & { correctAnswer?: string } {
  const s = step as unknown as Record<string, unknown>;
  const options = Array.isArray(s.options)
    ? (s.options as { label?: unknown; correct?: unknown }[])
    : null;
  const choices = options
    ?.map((o) => (typeof o.label === "string" ? o.label : null))
    .filter((v): v is string => !!v);
  const correct = options?.find((o) => o.correct === true);
  const question =
    typeof s.prompt === "string"
      ? s.prompt
      : typeof s.finalPrompt === "string"
        ? s.finalPrompt
        : undefined;
  const summarySource = [s.intro, s.body, s.teaching]
    .filter((v): v is string => typeof v === "string")
    .join(" ");
  return {
    question: question?.trim() || undefined,
    choices: choices && choices.length ? choices : undefined,
    correctAnswer:
      correct && typeof correct.label === "string"
        ? correct.label
        : step.type === "challenge"
          ? `${step.targetProbability}%`
          : undefined,
    stepSummary: excerpt(summarySource || step.title),
  };
}

export function lessonContextFromStep(lesson: Lesson, stepIndex: number): ActiveLessonContext | null {
  const step = lesson.steps[stepIndex];
  if (!step) return null;
  const conceptTag = primaryConcept(lesson.id);
  const { question, choices, stepSummary } = describeStep(step);
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    stepId: step.id,
    stepIndex,
    stepCount: lesson.steps.length,
    stepTitle: step.title,
    stepType: step.type,
    conceptTag,
    concept: conceptTag ? CONCEPT_LABEL[conceptTag] : lesson.title,
    question,
    choices,
    stepSummary,
  };
}

/**
 * Server-side lookup of the graded answer for a question, so the client never
 * has to send it. Matches the exact prompt text within the lesson.
 */
export function correctAnswerFor(lesson: Lesson | undefined, question: string | undefined): string | undefined {
  if (!lesson || !question) return undefined;
  const target = question.trim();
  for (const step of lesson.steps) {
    const d = describeStep(step);
    if (d.question === target) return d.correctAnswer;
  }
  return undefined;
}

export function setActiveLessonContext(ctx: ActiveLessonContext | null): void {
  active = ctx;
}

export function getActiveLessonContext(): ActiveLessonContext | null {
  return active;
}

/** Record a graded attempt so hints can react to the learner's current answer. */
export function reportQuestionAttempt(
  lessonId: string | undefined,
  question: string | undefined,
  studentAnswer: string,
  correct: boolean,
  feedback?: string
): void {
  if (!lessonId || !question) return;
  const key = questionKey(lessonId, question);
  const prev = attempts.get(key) ?? { studentAnswer: null, incorrectAttempts: 0 };
  attempts.set(key, {
    studentAnswer,
    incorrectAttempts: correct ? prev.incorrectAttempts : prev.incorrectAttempts + 1,
    lastFeedback: correct ? undefined : feedback,
  });
}

export function getQuestionAttempt(lessonId: string, question: string): QuestionAttemptState {
  return attempts.get(questionKey(lessonId, question)) ?? { studentAnswer: null, incorrectAttempts: 0 };
}
