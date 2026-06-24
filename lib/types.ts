import type { Timestamp } from "firebase/firestore";

export type StepType =
  | "explanation"
  | "informative"
  | "bit-explorer"
  | "prediction"
  | "playground"
  | "simulation"
  | "single-measurement"
  | "fresh-batch"
  | "collapse-check"
  | "gate-playground"
  | "gate-sequence"
  | "circuit-prediction"
  | "circuit-builder"
  | "circuit-playback"
  | "wave-explorer"
  | "path-amplitudes"
  | "interference-sim"
  | "challenge"
  | "reflection";

export type GateId = "X" | "H";

export interface PredictionOption {
  id: string;
  label: string;
  feedback: string;
  correct?: boolean;
}

export interface ResourceLink {
  label: string;
  url: string;
  description?: string;
  kind?: "article" | "docs" | "video";
}

interface BaseStep {
  id: string;
  title: string;
}

export interface ExplanationStep extends BaseStep {
  type: "explanation";
  body: string;
}

/** Polished, non-interactive explanation card with optional visual and resources. */
export interface InformativeStep extends BaseStep {
  type: "informative";
  body: string[];
  emoji?: string;
  resources?: ResourceLink[];
}

/** Interactive 0/1 toggle plus a yes/no question with feedback. */
export interface BitExplorerStep extends BaseStep {
  type: "bit-explorer";
  prompt: string;
  options: PredictionOption[];
}

/** Predict-before-explain multiple choice. Used for concept predictions. */
export interface PredictionStep extends BaseStep {
  type: "prediction";
  prompt: string;
  options: PredictionOption[];
  teaching?: string;
}

/** Free-exploration slider with live probability bars. */
export interface PlaygroundStep extends BaseStep {
  type: "playground";
  body: string;
}

/** "Measure N times" simulation with an animated histogram. */
export interface SimulationStep extends BaseStep {
  type: "simulation";
  prompt: string;
  teaching: string;
  defaultProbability: number;
  sampleSize: number;
}

/** Measure a single qubit once and watch it collapse to one concrete result. */
export interface SingleMeasurementStep extends BaseStep {
  type: "single-measurement";
  body: string;
  probabilityOfOne: number;
  teaching: string;
}

/** Measure a small batch of freshly prepared qubits, shown as dots + counts. */
export interface FreshBatchStep extends BaseStep {
  type: "fresh-batch";
  body: string;
  prompt: string;
  probabilityOfOne: number;
  sampleSize: number;
  teaching: string;
}

/** Graded check about collapse: a freshly measured qubit keeps its result. */
export interface CollapseCheckStep extends BaseStep {
  type: "collapse-check";
  measuredResult: 0 | 1;
  prompt: string;
  options: PredictionOption[];
  teaching?: string;
}

/** Apply quantum gates to a qubit and watch its probabilities change. */
export interface GatePlaygroundStep extends BaseStep {
  type: "gate-playground";
  body: string;
  /** Starting P(1) (0 or 100 for a definite state). */
  initialPOne: number;
  /** Let the learner pick the starting definite state (0 or 1). */
  allowStateSelect?: boolean;
  gates: GateId[];
  /** If set, show a "Measure N fresh qubits" button + histogram. */
  measureSampleSize?: number;
  teaching: string;
}

/** Graded build challenge: apply gates to reach a target qubit state. */
export interface GateSequenceStep extends BaseStep {
  type: "gate-sequence";
  prompt: string;
  correctFeedback: string;
  incorrectFeedback: string;
  teaching?: string;
}

/** Graded prediction shown alongside a fixed circuit wire (|0> + gates + Measure). */
export interface CircuitPredictionStep extends BaseStep {
  type: "circuit-prediction";
  prompt: string;
  gates: GateId[];
  options: PredictionOption[];
  teaching?: string;
}

/** Graded build challenge: assemble a circuit that reaches a target qubit state. */
export interface CircuitBuilderStep extends BaseStep {
  type: "circuit-builder";
  prompt: string;
  /** Target P(1) at measurement: 100 (guarantee 1) or 50 (50/50). */
  targetPOne: number;
  correctFeedback: string;
  /** Shown when the learner measures before adding any gate. */
  feedbackMeasuredEmpty: string;
  /** Shown when the qubit is definite but a 50/50 was wanted (e.g. X only). */
  feedbackDefinite?: string;
  /** Shown when the qubit is 50/50 but a guaranteed result was wanted (e.g. H used). */
  feedbackSuperposition?: string;
  incorrectFeedback: string;
  teaching?: string;
}

/** Plays a fixed circuit, stepping the qubit's probabilities through each gate. */
export interface CircuitPlaybackStep extends BaseStep {
  type: "circuit-playback";
  body: string;
  gates: GateId[];
  teaching: string;
}

/**
 * Wave illustration of interference. Non-interactive (`interactive: false`)
 * shows an animated combined wave for the story setup; interactive shows two
 * amplitude sliders and the live combined wave.
 */
export interface WaveExplorerStep extends BaseStep {
  type: "wave-explorer";
  body: string[];
  interactive: boolean;
  teaching?: string;
}

/**
 * Two contributing paths whose signed amplitudes (+1 / -1) add or cancel.
 * Experiment mode is free exploration; the build modes are graded challenges.
 */
export interface PathAmplitudesStep extends BaseStep {
  type: "path-amplitudes";
  body: string;
  mode: "experiment" | "build-constructive" | "build-destructive";
  correctFeedback?: string;
  incorrectFeedback?: string;
  teaching?: string;
}

/** Run many measurements for constructive vs destructive interference cases. */
export interface InterferenceSimStep extends BaseStep {
  type: "interference-sim";
  body: string;
  teaching: string;
}

/** Slider challenge graded against a target with tolerance. */
export interface ChallengeStep extends BaseStep {
  type: "challenge";
  prompt: string;
  targetProbability: number;
  tolerance: number;
  correctFeedback: string;
  incorrectFeedback: string;
}

/** Summary card shown at the end of the lesson. */
export interface ReflectionStep extends BaseStep {
  type: "reflection";
  intro: string;
  points: string[];
}

export type LessonStep =
  | ExplanationStep
  | InformativeStep
  | BitExplorerStep
  | PredictionStep
  | PlaygroundStep
  | SimulationStep
  | SingleMeasurementStep
  | FreshBatchStep
  | CollapseCheckStep
  | GatePlaygroundStep
  | GateSequenceStep
  | CircuitPredictionStep
  | CircuitBuilderStep
  | CircuitPlaybackStep
  | WaveExplorerStep
  | PathAmplitudesStep
  | InterferenceSimStep
  | ChallengeStep
  | ReflectionStep;

export interface LessonBadge {
  id: string;
  title: string;
  subtitle: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
  badge?: LessonBadge;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface LessonProgress {
  /** Position within the current (resumable) run. */
  currentStep: number;
  /** Sticky: true once the lesson has ever been completed. */
  completed: boolean;
  /** First completion time (never overwritten on replay). */
  completedAt: Timestamp | null;
  /** Number of completed runs. */
  attempts: number;
  /** Best (fewest) challenge attempts across completed runs. */
  bestChallengeAttempts: number | null;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Timestamp | null;
  badges: string[];
  streak: number;
  lastActiveDate: string;
  progress: Record<string, LessonProgress>;
}
