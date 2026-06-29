"use client";

import { useState } from "react";
import type { LessonStep } from "@/lib/types";
import QubitSlider from "./QubitSlider";
import ProbabilityVisual from "./ProbabilityVisual";
import PredictionChoice from "./PredictionChoice";
import ClassicalBitToggle from "./ClassicalBitToggle";
import MeasurementSimulator from "./MeasurementSimulator";
import SingleMeasurementSimulator from "./SingleMeasurementSimulator";
import FreshQubitBatchSimulator from "./FreshQubitBatchSimulator";
import CollapseCheckVisual from "./CollapseCheckVisual";
import GatePlayground from "./GatePlayground";
import GateSequenceBuilder from "./GateSequenceBuilder";
import CircuitWire from "./CircuitWire";
import CircuitPlayback from "./CircuitPlayback";
import CircuitBuilder from "./CircuitBuilder";
import WaveVisualizer from "./WaveVisualizer";
import PathAmplitudeBuilder from "./PathAmplitudeBuilder";
import InterferenceSimulator from "./InterferenceSimulator";
import ReflectionCard from "./ReflectionCard";
import LearnMore from "./LearnMore";
import MathText from "./MathText";
import { getCorrectHeadline } from "@/lib/learning/progressive-feedback";
import ProgressiveFeedbackPanel from "./ProgressiveFeedbackPanel";
import WorkedExample from "./WorkedExample";
import { saveTowerHintContext } from "@/lib/companions/tower-context";
import { primaryConcept, type ConceptTag } from "@/lib/learning/concepts";
import { recordConceptResult } from "@/lib/learning/signals";
import BlochExplorer from "./BlochExplorer";
import TwoQubitSimulator from "./TwoQubitSimulator";
import GateLab from "./GateLab";
import AmplitudeExplorer from "./AmplitudeExplorer";
import WaveInterference from "./WaveInterference";
import PathAmplitudeDiagram from "./PathAmplitudeDiagram";
import TwoQubitExplorer from "./TwoQubitExplorer";
import BellStateBuilder from "./BellStateBuilder";
import CorrelationVisualizer from "./CorrelationVisualizer";
import QuantumCircuitRunner from "./QuantumCircuitRunner";
import OracleExplorer from "./OracleExplorer";
import SearchExplorer from "./SearchExplorer";
import AmplitudeAmplifier from "./AmplitudeAmplifier";
import PatternExplorer from "./PatternExplorer";
import ProblemClassifier from "./ProblemClassifier";
import HardwareComparison from "./HardwareComparison";
import DecoherenceSimulator from "./DecoherenceSimulator";
import ErrorCorrectionExplorer from "./ErrorCorrectionExplorer";
import ApplicationClassifier from "./ApplicationClassifier";
import TechnologyTimeline from "./TechnologyTimeline";
import UnitSigil, { sigilForUnitId } from "./dashboard/UnitSigil";
import { getUnits } from "@/content/lessons";

/**
 * Renders a single lesson step. Interactive steps report when the learner may
 * advance (onCanAdvanceChange). Graded steps (bit-explorer, prediction,
 * challenge) only unlock on a correct answer and report each try via
 * onGradedAttempt so the parent can record the best (fewest-attempts) run.
 * Always-advanceable steps (informative, explanation, playground, reflection)
 * are handled by the parent's default gating.
 *
 * The parent should pass key={step.id} so component state resets per step.
 */
export default function LessonStepRenderer({
  step,
  onCanAdvanceChange,
  onGradedAttempt,
  lessonTitle,
  lessonId,
}: {
  step: LessonStep;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
  lessonTitle?: string;
  lessonId?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
      <Body
        step={step}
        onCanAdvanceChange={onCanAdvanceChange}
        onGradedAttempt={onGradedAttempt}
        lessonTitle={lessonTitle}
        lessonId={lessonId}
      />
    </div>
  );
}

function Body({
  step,
  onCanAdvanceChange,
  onGradedAttempt,
  lessonTitle,
  lessonId,
}: {
  step: LessonStep;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
  lessonTitle?: string;
  lessonId?: string;
}) {
  const conceptTag: ConceptTag | null = lessonId ? primaryConcept(lessonId) : null;
  switch (step.type) {
    case "explanation":
      return (
        <p className="mt-3 max-w-prose text-base leading-7 text-slate-700">
          <MathText>{step.body}</MathText>
        </p>
      );

    case "informative":
      return (
        <InformativeView step={step} />
      );

    case "bit-explorer":
      return (
        <div className="mt-4">
          <div className="my-6 flex justify-center">
            <ClassicalBitToggle />
          </div>
          <p className="max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <PredictionChoice
            options={step.options}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
            conceptTag={conceptTag}
          />
        </div>
      );

    case "prediction":
      return (
        <div className="mt-3">
          <p className="max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
            hintMeta={{ lessonId, lessonTitle, prompt: step.prompt }}
            stepKey={step.id}
            conceptTag={conceptTag}
          />
        </div>
      );

    case "playground":
      return <PlaygroundView body={step.body} />;

    case "simulation":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <MeasurementSimulator
            defaultProbability={step.defaultProbability}
            sampleSize={step.sampleSize}
            teaching={step.teaching}
            onMeasured={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "single-measurement":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <SingleMeasurementSimulator
            probabilityOfOne={step.probabilityOfOne}
            teaching={step.teaching}
            onMeasured={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "fresh-batch":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <FreshQubitBatchSimulator
            probabilityOfOne={step.probabilityOfOne}
            sampleSize={step.sampleSize}
            prompt={step.prompt}
            teaching={step.teaching}
            onRun={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "collapse-check":
      return (
        <div className="mt-4">
          <CollapseCheckVisual result={step.measuredResult} />
          <p className="mt-5 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
            conceptTag={conceptTag}
          />
        </div>
      );

    case "gate-playground":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <GatePlayground
            initialPOne={step.initialPOne}
            allowStateSelect={step.allowStateSelect}
            gates={step.gates}
            measureSampleSize={step.measureSampleSize}
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "gate-sequence":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <GateSequenceBuilder
            correctFeedback={step.correctFeedback}
            incorrectFeedback={step.incorrectFeedback}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "circuit-prediction":
      return (
        <div className="mt-3">
          <div className="mb-5">
            <CircuitWire gates={step.gates} />
          </div>
          <p className="max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
            conceptTag={conceptTag}
          />
        </div>
      );

    case "circuit-playback":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <CircuitPlayback
            gates={step.gates}
            teaching={step.teaching}
            onPlayed={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "circuit-builder":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>
          <CircuitBuilder
            targetPOne={step.targetPOne}
            correctFeedback={step.correctFeedback}
            feedbackMeasuredEmpty={step.feedbackMeasuredEmpty}
            feedbackDefinite={step.feedbackDefinite}
            feedbackSuperposition={step.feedbackSuperposition}
            incorrectFeedback={step.incorrectFeedback}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "wave-explorer":
      return (
        <div className="mt-3">
          <div className="mb-6 flex flex-col gap-3">
            {step.body.map((paragraph, i) => (
              <p key={i} className="max-w-prose text-base leading-7 text-slate-700">
                <MathText>{paragraph}</MathText>
              </p>
            ))}
          </div>
          <WaveVisualizer
            interactive={step.interactive}
            onInteracted={() => onCanAdvanceChange(true)}
          />
          {step.interactive && step.teaching && (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              <MathText>{step.teaching}</MathText>
            </p>
          )}
        </div>
      );

    case "path-amplitudes":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <PathAmplitudeBuilder
            mode={step.mode}
            correctFeedback={step.correctFeedback}
            incorrectFeedback={step.incorrectFeedback}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "interference-sim":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700"><MathText>{step.body}</MathText></p>
          <InterferenceSimulator
            teaching={step.teaching}
            onBothRun={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "bloch-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <BlochExplorer
            showPhi={step.showPhi}
            showXMeasurement={step.showXMeasurement}
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "two-qubit":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <TwoQubitSimulator teaching={step.teaching} onRun={() => onCanAdvanceChange(true)} />
        </div>
      );

    case "gate-lab":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <GateLab
            allowedGates={step.allowedGates}
            start={step.start}
            allowStartToggle={step.allowStartToggle}
            preset={step.preset}
            target={step.target}
            measure={step.measure}
            correctFeedback={step.correctFeedback}
            incorrectFeedback={step.incorrectFeedback}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "amplitude-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <AmplitudeExplorer teaching={step.teaching} onInteracted={() => onCanAdvanceChange(true)} />
        </div>
      );

    case "wave-interference":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <WaveInterference teaching={step.teaching} onInteracted={() => onCanAdvanceChange(true)} />
        </div>
      );

    case "path-diagram":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <PathAmplitudeDiagram teaching={step.teaching} onInteracted={() => onCanAdvanceChange(true)} />
        </div>
      );

    case "two-qubit-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <TwoQubitExplorer
            teaching={step.teaching}
            preset={step.preset}
            allowedGates={step.allowedGates}
            showCnot={step.showCnot}
            allowInitialChoice={step.allowInitialChoice}
            lockCircuit={step.lockCircuit}
            allowMeasureSingle={step.allowMeasureSingle}
            allowMeasureBoth={step.allowMeasureBoth}
            allowHistogram={step.allowHistogram}
            showMarginals={step.showMarginals}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "bell-builder":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <BellStateBuilder
            target={step.target}
            correctFeedback={step.correctFeedback}
            incorrectFeedback={step.incorrectFeedback}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "correlation":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <CorrelationVisualizer
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "circuit-runner":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <QuantumCircuitRunner
            teaching={step.teaching}
            allowedGates={step.allowedGates}
            showCnot={step.showCnot}
            goalIndex={step.goalIndex}
            correctFeedback={step.correctFeedback}
            incorrectFeedback={step.incorrectFeedback}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "oracle-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <OracleExplorer teaching={step.teaching} onInteracted={() => onCanAdvanceChange(true)} />
        </div>
      );

    case "search-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <SearchExplorer
            teaching={step.teaching}
            size={step.size}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "amplitude-amplifier":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <AmplitudeAmplifier
            teaching={step.teaching}
            size={step.size}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "pattern-explorer":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <PatternExplorer
            teaching={step.teaching}
            n={step.n}
            cycle={step.cycle}
            period={step.period}
            factors={step.factors}
            terms={step.terms}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "problem-classifier":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <ProblemClassifier
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "hardware-comparison":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <HardwareComparison
            platforms={step.platforms}
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "decoherence":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <DecoherenceSimulator
            teaching={step.teaching}
            showGates={step.showGates}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "error-correction":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <ErrorCorrectionExplorer
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "app-classifier":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <ApplicationClassifier
            categories={step.categories}
            items={step.items}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "tech-timeline":
      return (
        <div className="mt-3">
          <p className="mb-6 max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.body}</MathText>
          </p>
          <TechnologyTimeline
            milestones={step.milestones}
            teaching={step.teaching}
            onInteracted={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "worked-example":
      return (
        <WorkedExample
          intro={step.intro}
          steps={step.steps}
          finalPrompt={step.finalPrompt}
          options={step.options}
          teaching={step.teaching}
          conceptTag={conceptTag}
          onCanAdvanceChange={onCanAdvanceChange}
          onAttempt={onGradedAttempt}
        />
      );

    case "challenge":
      return (
        <ChallengeView
          step={step}
          onCanAdvanceChange={onCanAdvanceChange}
          onGradedAttempt={onGradedAttempt}
          lessonTitle={lessonTitle}
          lessonId={lessonId}
          conceptTag={conceptTag}
        />
      );

    case "course-map":
      return (
        <div className="mt-4">
          <p className="max-w-prose text-base leading-7 text-slate-700">
            <MathText>{step.intro}</MathText>
          </p>
          <ol className="mt-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-[radial-gradient(120%_120%_at_50%_-10%,#1e1245_0%,#0d0a24_60%,#070611_100%)] p-4 sm:p-5">
            {getUnits().map((unit, i) => (
              <li
                key={unit.id}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm"
              >
                <span className="relative shrink-0">
                  <UnitSigil kind={sigilForUnitId(unit.id)} status="active" />
                  <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white ring-2 ring-[#0d0a24]">
                    {i + 1}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-serif font-semibold text-white">{unit.title}</span>
                  <span className="block text-sm leading-6 text-slate-300">{unit.description}</span>
                </span>
              </li>
            ))}
          </ol>
          {step.outro && (
            <p className="mt-6 max-w-prose text-base leading-7 text-slate-700">
              <MathText>{step.outro}</MathText>
            </p>
          )}
        </div>
      );

    case "reflection":
      return (
        <div className="mt-4">
          <ReflectionCard intro={step.intro} points={step.points} next={step.next} />
        </div>
      );
  }
}

const INFORMATIVE_TEXT_CLASS = "w-full max-w-none text-base leading-7 text-slate-700";

function InformativeView({ step }: { step: Extract<LessonStep, { type: "informative" }> }) {
  return (
    <div className="mt-4 w-full">
      <div className="flex w-full min-w-0 flex-col gap-3">
        {step.body.map((paragraph, i) => (
          <p key={i} className={INFORMATIVE_TEXT_CLASS}>
            <MathText>{paragraph}</MathText>
          </p>
        ))}
      </div>
      <PrimaryCallout step={step} />
      {step.resources && <LearnMore resources={step.resources} />}
    </div>
  );
}

/** Small learning-science callout (misconception, real-world, why, memory). */
const CALLOUT_TONE = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
} as const;

const CALLOUT_BODY = {
  amber: "text-amber-900",
  sky: "text-sky-900",
  violet: "text-violet-900",
  indigo: "text-indigo-900",
} as const;

function Callout({
  tone,
  label,
  text,
}: {
  tone: keyof typeof CALLOUT_TONE;
  label: string;
  text: string;
}) {
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 ${CALLOUT_TONE[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-sm leading-6 ${CALLOUT_BODY[tone]}`}>
        <MathText>{text}</MathText>
      </p>
    </div>
  );
}

function ListCallout({
  tone,
  label,
  items,
}: {
  tone: keyof typeof CALLOUT_TONE;
  label: string;
  items: string[];
}) {
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 ${CALLOUT_TONE[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <ul className={`mt-2 space-y-1.5 text-sm leading-6 ${CALLOUT_BODY[tone]}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" aria-hidden="true" />
            <span>
              <MathText>{item}</MathText>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Show the misconception to correct, plus one connection callout (real-world,
 * why it matters, or a memory link). At most two small callouts per step keeps
 * the screen calm while surfacing both the pitfall and why the idea matters.
 */
function PrimaryCallout({ step }: { step: Extract<LessonStep, { type: "informative" }> }) {
  const connection = step.applications?.length
    ? {
        kind: "list" as const,
        tone: "sky" as const,
        label: step.realWorldLabel ?? "Current applications",
        items: step.applications,
      }
    : step.realWorld
      ? {
          kind: "text" as const,
          tone: "sky" as const,
          label: step.realWorldLabel ?? "Where you meet this",
          text: step.realWorld,
        }
      : step.whyMatters
        ? {
            kind: "text" as const,
            tone: "violet" as const,
            label: "Why this matters",
            text: step.whyMatters,
          }
        : step.memoryConnection
          ? {
              kind: "text" as const,
              tone: "indigo" as const,
              label: "Remember",
              text: step.memoryConnection,
            }
          : null;

  if (!step.misconception && !connection) return null;

  return (
    <>
      {step.misconception && (
        <Callout tone="amber" label="Common misconception" text={step.misconception} />
      )}
      {connection?.kind === "list" && (
        <ListCallout tone={connection.tone} label={connection.label} items={connection.items} />
      )}
      {connection?.kind === "text" && (
        <Callout tone={connection.tone} label={connection.label} text={connection.text} />
      )}
    </>
  );
}

/** Sample one playground measurement: 1 with `probPercent`% chance, else 0. */
function samplePlaygroundOutcome(probPercent: number): 0 | 1 {
  return Math.random() * 100 < probPercent ? 1 : 0;
}

function PlaygroundView({ body }: { body: string }) {
  const [pOne, setPOne] = useState(50);
  const [prediction, setPrediction] = useState<0 | 1 | null>(null);
  const [shot, setShot] = useState<0 | 1 | null>(null);
  const [runs, setRuns] = useState<{ zeros: number; ones: number } | null>(null);

  // Changing the prepared state invalidates any prior measurement.
  function changeProbability(value: number) {
    setPOne(value);
    setShot(null);
    setRuns(null);
    setPrediction(null);
  }

  function measureOnce() {
    setShot(samplePlaygroundOutcome(pOne));
  }

  function measureMany() {
    let ones = 0;
    for (let i = 0; i < 20; i++) {
      if (samplePlaygroundOutcome(pOne) === 1) ones++;
    }
    setRuns({ ones, zeros: 20 - ones });
  }

  return (
    <div className="mt-3">
      <p className="max-w-prose text-base leading-7 text-slate-700">{body}</p>
      <div className="mt-6">
        <ProbabilityVisual pOne={pOne} />
      </div>
      <div className="mt-6">
        <QubitSlider value={pOne} onChange={changeProbability} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-700">
          You set the probability. Predict one measurement before taking it:
        </p>
        <div className="mt-2 flex gap-2">
          {([0, 1] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setPrediction(g)}
              aria-pressed={prediction === g}
              className={`h-9 w-12 rounded-lg border text-sm font-bold tabular-nums transition-colors ${
                prediction === g
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={measureOnce}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-transform hover:bg-indigo-700 active:scale-95"
          >
            Measure once
          </button>
          <button
            type="button"
            onClick={measureMany}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Measure 20 fresh qubits
          </button>
        </div>

        {shot !== null && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Measured <span className="font-bold tabular-nums text-slate-900">{shot}</span>
            {prediction !== null && prediction !== shot
              ? " - not what you predicted. "
              : ". "}
            One shot only ever returns 0 or 1, so it can&apos;t reveal the setting you chose.
          </p>
        )}
        {runs && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            20 fresh qubits gave {runs.zeros} zeros and {runs.ones} ones. The setting hides
            in the statistics - only many measurements bring it into view.
          </p>
        )}
      </div>
    </div>
  );
}

function ChallengeView({
  step,
  onCanAdvanceChange,
  onGradedAttempt,
  lessonTitle,
  lessonId,
  conceptTag,
}: {
  step: Extract<LessonStep, { type: "challenge" }>;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
  lessonTitle?: string;
  lessonId?: string;
  conceptTag?: ConceptTag | null;
}) {
  const [value, setValue] = useState(50);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [showExplanationRequested, setShowExplanationRequested] = useState(false);
  const solved = result === "correct";

  function check() {
    if (solved) return;
    onGradedAttempt();
    const passed = Math.abs(value - step.targetProbability) <= step.tolerance;
    setResult(passed ? "correct" : "incorrect");
    onCanAdvanceChange(passed);
    if (conceptTag) recordConceptResult(conceptTag, passed, { misconception: passed ? undefined : step.incorrectFeedback });
    if (!passed) {
      setWrongCount((c) => c + 1);
      saveTowerHintContext({
        lessonId,
        lessonTitle,
        prompt: step.prompt,
        selectedWrong: `${value}%`,
        correctAnswer: `${step.targetProbability}%`,
        feedback: step.incorrectFeedback,
      });
    }
  }

  const hintContext =
    result === "incorrect"
      ? {
          lessonId,
          lessonTitle,
          prompt: step.prompt,
          selectedWrong: `${value}%`,
          correctAnswer: `${step.targetProbability}%`,
          feedback: step.incorrectFeedback,
        }
      : null;

  return (
    <div className="mt-3">
      <p className="max-w-prose text-base leading-7 text-slate-700"><MathText>{step.prompt}</MathText></p>

      <div className="mt-6">
        <ProbabilityVisual pOne={value} />
      </div>

      <div className="mt-6">
        <QubitSlider value={value} onChange={setValue} disabled={solved} />
      </div>

      {!solved && (
        <button
          type="button"
          onClick={check}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Check answer
        </button>
      )}

      {result === "correct" && (
        <ProgressiveFeedbackPanel
          isCorrect
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{
            conceptTag: conceptTag ?? null,
            fullExplanation: step.correctFeedback,
            correctAnswerLabel: `${step.targetProbability}%`,
          }}
          correctHeadline={getCorrectHeadline(wrongCount)}
          correctExplanation={step.correctFeedback}
          stepKey={step.id}
        />
      )}
      {result === "incorrect" && (
        <ProgressiveFeedbackPanel
          isCorrect={false}
          wrongCount={wrongCount}
          showExplanationRequested={showExplanationRequested}
          onRequestExplanation={() => setShowExplanationRequested(true)}
          questionContext={{
            conceptTag: conceptTag ?? null,
            fullExplanation: `${step.incorrectFeedback} The target was ${step.targetProbability}%.`,
            correctAnswerLabel: `${step.targetProbability}%`,
          }}
          hintContext={hintContext}
          stepKey={step.id}
        />
      )}
    </div>
  );
}
