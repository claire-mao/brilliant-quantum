import type { Timestamp } from "firebase/firestore";
import type { BellId, TwoQubitOp } from "./twoqubit";

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
  | "bloch-explorer"
  | "two-qubit"
  | "gate-lab"
  | "amplitude-explorer"
  | "wave-interference"
  | "path-diagram"
  | "two-qubit-explorer"
  | "bell-builder"
  | "correlation"
  | "circuit-runner"
  | "oracle-explorer"
  | "search-explorer"
  | "amplitude-amplifier"
  | "pattern-explorer"
  | "problem-classifier"
  | "hardware-comparison"
  | "decoherence"
  | "error-correction"
  | "app-classifier"
  | "tech-timeline"
  | "challenge"
  | "worked-example"
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
  /** Deprecated decorative emoji (no longer rendered); kept for back-compat. */
  emoji?: string;
  /** Optional "Common misconception" callout, shown below the body. */
  misconception?: string;
  /** Optional "Where you meet this" real-world connection callout. */
  realWorld?: string;
  /** Optional one-line "Why this matters" callout (what it unlocks next). */
  whyMatters?: string;
  /** Optional "Remember" callout linking back to an earlier idea. */
  memoryConnection?: string;
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

/**
 * Interactive Bloch sphere. The learner drags theta (polar angle) and optionally
 * phi (azimuth / relative phase) and watches the measurement probabilities update.
 */
export interface BlochExplorerStep extends BaseStep {
  type: "bloch-explorer";
  body: string;
  /** Expose the phi (relative phase) control. */
  showPhi: boolean;
  /** Add a "measure in the X basis" toggle to expose relative-phase effects. */
  showXMeasurement?: boolean;
  teaching: string;
}

/** Two-qubit circuit + measurement-correlation simulator (H, X, Z, CNOT). */
export interface TwoQubitStep extends BaseStep {
  type: "two-qubit";
  body: string;
  teaching: string;
}

/**
 * Single-qubit gate lab over {|0>,|1>,|+>,|->} with X/H/Z. In exploration mode
 * the learner applies gates and measures; in graded mode (a `target` state is
 * set) they must drive the qubit to the target, e.g. to undo a circuit.
 */
export interface GateLabStep extends BaseStep {
  type: "gate-lab";
  body: string;
  allowedGates: ("X" | "H" | "Z")[];
  /** Starting state (default "0"). */
  start?: "0" | "1" | "+" | "-";
  /** Let the learner switch the start between |0> and |1>. */
  allowStartToggle?: boolean;
  /** Gates pre-applied before the learner acts (e.g. a circuit to undo). */
  preset?: ("X" | "H" | "Z")[];
  /** Graded mode: the state the learner must reach. */
  target?: "0" | "1" | "+" | "-";
  /** Exploration mode: show a "measure N" histogram. */
  measure?: boolean;
  correctFeedback?: string;
  incorrectFeedback?: string;
  teaching: string;
}

/** One quantum path: amplitude slider in [-1, 1] with P = |amplitude|^2. */
export interface AmplitudeExplorerStep extends BaseStep {
  type: "amplitude-explorer";
  body: string;
  teaching: string;
}

/** Two amplitudes added as signed contributions; P = |A1 + A2|^2. */
export interface WaveInterferenceStep extends BaseStep {
  type: "wave-interference";
  body: string;
  teaching: string;
}

/** Several computational paths: flip a phase and interfere to reshape amplitudes. */
export interface PathDiagramStep extends BaseStep {
  type: "path-diagram";
  body: string;
  teaching: string;
}

/**
 * Reusable two-qubit interaction engine. Props mirror TwoQubitExplorer: choose
 * an initial state, apply gates / CNOT, measure one or both qubits, run a
 * histogram, and optionally show per-qubit marginals.
 */
export interface TwoQubitExplorerStep extends BaseStep {
  type: "two-qubit-explorer";
  body: string;
  teaching: string;
  /** Gates pre-applied from |00> before the learner acts. */
  preset?: TwoQubitOp[];
  allowedGates?: ("X" | "H" | "Z")[];
  showCnot?: boolean;
  allowInitialChoice?: boolean;
  /** Hide the gate palette (measurement-only experiments). */
  lockCircuit?: boolean;
  allowMeasureSingle?: boolean;
  allowMeasureBoth?: boolean;
  allowHistogram?: boolean;
  /** Show per-qubit marginal probabilities P(q=1). */
  showMarginals?: boolean;
}

/** Graded build challenge: assemble gates from |00> to reach a target Bell state. */
export interface BellBuilderStep extends BaseStep {
  type: "bell-builder";
  body: string;
  target: BellId;
  correctFeedback: string;
  incorrectFeedback: string;
  teaching: string;
}

/** Classical correlation sandbox: correlated vs independent bit pairs. */
export interface CorrelationStep extends BaseStep {
  type: "correlation";
  body: string;
  teaching: string;
}

/**
 * Two-qubit "program" runner: build a gate sequence and run it. Free mode
 * unlocks on a run; graded mode (a `goalIndex` is set) requires the circuit's
 * output to be that basis state.
 */
export interface CircuitRunnerStep extends BaseStep {
  type: "circuit-runner";
  body: string;
  teaching: string;
  allowedGates?: ("X" | "H" | "Z")[];
  showCnot?: boolean;
  /** 0..3 (|00>,|01>,|10>,|11>); set to make the step a graded build challenge. */
  goalIndex?: number;
  correctFeedback?: string;
  incorrectFeedback?: string;
}

/** Deutsch-Jozsa intuition: query a hidden function classically vs once quantumly. */
export interface OracleExplorerStep extends BaseStep {
  type: "oracle-explorer";
  body: string;
  teaching: string;
}

/** Classical unstructured search over N boxes. */
export interface SearchExplorerStep extends BaseStep {
  type: "search-explorer";
  body: string;
  teaching: string;
  size?: number;
}

/** Grover amplitude amplification across N answers. */
export interface AmplitudeAmplifierStep extends BaseStep {
  type: "amplitude-amplifier";
  body: string;
  teaching: string;
  size?: number;
}

/** Shor period-finding intuition over a repeating pattern. */
export interface PatternExplorerStep extends BaseStep {
  type: "pattern-explorer";
  body: string;
  teaching: string;
  n?: number;
  cycle?: number[];
  period?: number;
  factors?: [number, number];
  terms?: number;
}

/** Graded classification of problems by quantum speedup. */
export interface ProblemClassifierStep extends BaseStep {
  type: "problem-classifier";
  body: string;
  teaching: string;
}

/** A hardware platform for the HardwareComparison engine. */
export interface HardwarePlatform {
  id: string;
  name: string;
  temperature: string;
  strengths: string;
  limitations: string;
  metrics: {
    gateSpeed: number;
    coherence: number;
    scalability: number;
    fidelity: number;
    compactness: number;
  };
}

/** A category and an item for the generic classifier engine. */
export interface ClassifierCategory {
  key: string;
  label: string;
}
export interface ClassifierItem {
  id: string;
  label: string;
  answer: string;
  note: string;
}

/** A milestone for the TechnologyTimeline engine. */
export interface Milestone {
  id: string;
  period: string;
  title: string;
  detail: string;
}

/** Hardware gallery / head-to-head comparison of qubit platforms. */
export interface HardwareComparisonStep extends BaseStep {
  type: "hardware-comparison";
  body: string;
  teaching: string;
  platforms: HardwarePlatform[];
}

/** Decoherence visualizer: a shrinking Bloch vector under noise/time/gates. */
export interface DecoherenceStep extends BaseStep {
  type: "decoherence";
  body: string;
  teaching: string;
  showGates?: boolean;
}

/** Repetition-code error-correction sandbox. */
export interface ErrorCorrectionStep extends BaseStep {
  type: "error-correction";
  body: string;
  teaching: string;
}

/** Generic graded classifier (applications, platforms, traits, ...). */
export interface AppClassifierStep extends BaseStep {
  type: "app-classifier";
  body: string;
  teaching: string;
  categories: ClassifierCategory[];
  items: ClassifierItem[];
}

/** Interactive timeline of technology eras. */
export interface TechTimelineStep extends BaseStep {
  type: "tech-timeline";
  body: string;
  teaching: string;
  milestones: Milestone[];
}

/**
 * Worked example: show expert reasoning step by step, hide the final step, then
 * ask the learner to complete it (and give feedback). Accelerates novice
 * learning before an independent challenge.
 */
export interface WorkedExampleStep extends BaseStep {
  type: "worked-example";
  /** The problem / setup being worked. */
  intro: string;
  /** Expert reasoning shown in order (the worked-out steps). */
  steps: string[];
  /** Prompt for the hidden final step the learner must complete. */
  finalPrompt: string;
  /** Choices for the final step; exactly one is correct. */
  options: PredictionOption[];
  teaching?: string;
}

/** Summary card shown at the end of the lesson. */
export interface ReflectionStep extends BaseStep {
  type: "reflection";
  intro: string;
  points: string[];
  /** Optional one-line pointer to the next lesson, for narrative continuity. */
  next?: string;
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
  | BlochExplorerStep
  | TwoQubitStep
  | GateLabStep
  | AmplitudeExplorerStep
  | WaveInterferenceStep
  | PathDiagramStep
  | TwoQubitExplorerStep
  | BellBuilderStep
  | CorrelationStep
  | CircuitRunnerStep
  | OracleExplorerStep
  | SearchExplorerStep
  | AmplitudeAmplifierStep
  | PatternExplorerStep
  | ProblemClassifierStep
  | HardwareComparisonStep
  | DecoherenceStep
  | ErrorCorrectionStep
  | AppClassifierStep
  | TechTimelineStep
  | ChallengeStep
  | WorkedExampleStep
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

/** A chapter: a titled group of lessons (referenced by ID, in order). */
export interface Unit {
  id: string;
  title: string;
  description: string;
  /** Lesson IDs in order. Empty means the chapter is not built yet. */
  lessonIds: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  units: Unit[];
  /** Flat, ordered list of all lessons (kept for compatibility with helpers). */
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
