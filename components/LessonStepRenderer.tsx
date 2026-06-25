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
import ResourceCard from "./ResourceCard";

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
}: {
  step: LessonStep;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">{step.title}</h2>
      <Body
        step={step}
        onCanAdvanceChange={onCanAdvanceChange}
        onGradedAttempt={onGradedAttempt}
      />
    </div>
  );
}

function Body({
  step,
  onCanAdvanceChange,
  onGradedAttempt,
}: {
  step: LessonStep;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
}) {
  switch (step.type) {
    case "explanation":
      return <p className="mt-3 text-base leading-7 text-slate-700">{step.body}</p>;

    case "informative":
      return (
        <div className="mt-4">
          {step.emoji && (
            <div className="mb-4 text-4xl" aria-hidden="true">
              {step.emoji}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {step.body.map((paragraph, i) => (
              <p key={i} className="text-base leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
          {step.resources && step.resources.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Learn more
              </p>
              <div className="flex flex-col gap-2">
                {step.resources.map((resource) => (
                  <ResourceCard key={resource.url + resource.label} resource={resource} />
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case "bit-explorer":
      return (
        <div className="mt-4">
          <div className="my-6 flex justify-center">
            <ClassicalBitToggle />
          </div>
          <p className="text-base leading-7 text-slate-700">{step.prompt}</p>
          <PredictionChoice
            options={step.options}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "prediction":
      return (
        <div className="mt-3">
          <p className="text-base leading-7 text-slate-700">{step.prompt}</p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "playground":
      return <PlaygroundView body={step.body} />;

    case "simulation":
      return (
        <div className="mt-3">
          <p className="mb-6 text-base leading-7 text-slate-700">{step.prompt}</p>
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
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
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
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
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
          <p className="mt-5 text-base leading-7 text-slate-700">{step.prompt}</p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "gate-playground":
      return (
        <div className="mt-3">
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
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
          <p className="mb-6 text-base leading-7 text-slate-700">{step.prompt}</p>
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
          <p className="text-base leading-7 text-slate-700">{step.prompt}</p>
          <PredictionChoice
            options={step.options}
            teaching={step.teaching}
            onCanAdvanceChange={onCanAdvanceChange}
            onAttempt={onGradedAttempt}
          />
        </div>
      );

    case "circuit-playback":
      return (
        <div className="mt-3">
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
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
          <p className="mb-6 text-base leading-7 text-slate-700">{step.prompt}</p>
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
              <p key={i} className="text-base leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
          <WaveVisualizer
            interactive={step.interactive}
            onInteracted={() => onCanAdvanceChange(true)}
          />
          {step.interactive && step.teaching && (
            <p className="mt-4 text-sm leading-6 text-slate-500">{step.teaching}</p>
          )}
        </div>
      );

    case "path-amplitudes":
      return (
        <div className="mt-3">
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
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
          <p className="mb-6 text-base leading-7 text-slate-700">{step.body}</p>
          <InterferenceSimulator
            teaching={step.teaching}
            onBothRun={() => onCanAdvanceChange(true)}
          />
        </div>
      );

    case "challenge":
      return (
        <ChallengeView
          step={step}
          onCanAdvanceChange={onCanAdvanceChange}
          onGradedAttempt={onGradedAttempt}
        />
      );

    case "reflection":
      return (
        <div className="mt-4">
          <ReflectionCard intro={step.intro} points={step.points} />
        </div>
      );
  }
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
      <p className="text-base leading-7 text-slate-700">{body}</p>
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
}: {
  step: Extract<LessonStep, { type: "challenge" }>;
  onCanAdvanceChange: (canAdvance: boolean) => void;
  onGradedAttempt: () => void;
}) {
  const [value, setValue] = useState(50);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const solved = result === "correct";

  function check() {
    if (solved) return;
    onGradedAttempt();
    const passed = Math.abs(value - step.targetProbability) <= step.tolerance;
    setResult(passed ? "correct" : "incorrect");
    onCanAdvanceChange(passed);
  }

  return (
    <div className="mt-3">
      <p className="text-base leading-7 text-slate-700">{step.prompt}</p>

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

      {result && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm leading-6 ${
            result === "correct"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {result === "correct" ? step.correctFeedback : step.incorrectFeedback}
        </p>
      )}
      {result === "incorrect" && (
        <p className="mt-2 text-sm font-medium text-amber-700">
          Try again - adjust the slider and check once more.
        </p>
      )}
    </div>
  );
}
