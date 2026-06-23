import type { Timestamp } from "firebase/firestore";

export type StepType = "explanation" | "challenge";

export interface ExplanationStep {
  type: "explanation";
  id: string;
  title: string;
  body: string;
}

export interface ChallengeStep {
  type: "challenge";
  id: string;
  title: string;
  prompt: string;
  /** Target probability (0-100) of measuring 1. */
  targetProbability: number;
  /** Accepted absolute tolerance in percentage points (e.g. 5 => +/-5%). */
  tolerance: number;
  correctFeedback: string;
  incorrectFeedback: string;
}

export type LessonStep = ExplanationStep | ChallengeStep;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
  /** Locked/upcoming lessons are visible but not yet playable. */
  locked?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface LessonProgress {
  currentStep: number;
  completed: boolean;
  completedAt: Timestamp | null;
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
