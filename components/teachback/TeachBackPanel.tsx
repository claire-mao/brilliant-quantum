"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONCEPT_LABEL } from "@/lib/learning/concepts";
import { teachBackConcept, type TeachBackAnalysis } from "@/lib/ai/teachback";
import {
  getConceptMastery,
  recordTeachBackSession,
} from "@/lib/learning/teachback-profile";
import { playSound } from "@/lib/sound/sounds";
import TeachBackResults from "./TeachBackResults";

type Stage =
  | "intro"
  | "recording"
  | "transcribing"
  | "review"
  | "analyzing"
  | "results";

type InputMode = "voice" | "typed";

const MAX_RECORDING_SECONDS = 90;

const PROMPTS: Partial<Record<string, string>> = {
  superposition: "Explain what a qubit in superposition is, and what happens when you measure it.",
  measurement: "Explain what measurement does to a qubit, and what you would see if you measured the same qubit twice.",
  gates: "Explain what a quantum gate does to a qubit, using the X gate as your example.",
  entanglement: "Explain what it means for two qubits to be entangled, and what you see when you measure them.",
  qubits: "Explain how a qubit is different from a classical bit.",
  interference: "Explain how amplitudes interfere, and why that is different from adding probabilities.",
  phase: "Explain what relative phase is and how you could ever detect it.",
  "bloch-sphere": "Explain what a point on the Bloch sphere tells you about a qubit.",
  algorithms: "Explain where a quantum algorithm gets its advantage from.",
  hardware: "Explain why real quantum computers are hard to build.",
};

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m));
}

function describeMicError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Microphone access was blocked. Allow the microphone in your browser's address bar, or type your explanation instead.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found on this device. You can type your explanation instead.";
    case "NotReadableError":
      return "The microphone is in use by another app. Close it and retry, or type your explanation instead.";
    default:
      return "Could not start recording in this browser. You can type your explanation instead.";
  }
}

export default function TeachBackPanel({
  lessonId,
  lessonTitle,
  onClose,
}: {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}) {
  const conceptTag = teachBackConcept(lessonId);
  const conceptLabel = conceptTag ? CONCEPT_LABEL[conceptTag] : lessonTitle;
  const prompt = (conceptTag && PROMPTS[conceptTag]) ?? `Explain the main idea of ${lessonTitle} in your own words.`;

  const [stage, setStage] = useState<Stage>("intro");
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [analysis, setAnalysis] = useState<TeachBackAnalysis | null>(null);
  const [source, setSource] = useState<"llama" | "fallback">("llama");
  const [priorMastery, setPriorMastery] = useState<number | null>(null);
  const [newMastery, setNewMastery] = useState<number | null>(null);
  const [micSupported, setMicSupported] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    const id = window.setTimeout(() => {
      setMicSupported(supported);
      if (!supported) {
        setInputMode("typed");
        setNotice("Voice recording is not available in this browser, so you can type your explanation.");
      }
      if (conceptTag) setPriorMastery(getConceptMastery(conceptTag));
    }, 0);
    return () => clearTimeout(id);
  }, [conceptTag]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage !== "recording" && stage !== "analyzing" && stage !== "transcribing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, stage]);

  useEffect(() => {
    if (stage === "review" && inputMode === "typed") textareaRef.current?.focus();
  }, [stage, inputMode]);

  const switchToTyped = useCallback((message?: string) => {
    setInputMode("typed");
    setError(null);
    if (message) setNotice(message);
    setStage("review");
  }, []);

  const transcribe = useCallback(
    async (blob: Blob) => {
      setStage("transcribing");
      setError(null);
      try {
        const form = new FormData();
        form.append("audio", blob, "teachback.webm");
        const res = await fetch("/api/teachback/transcribe", { method: "POST", body: form });
        const data = (await res.json().catch(() => ({}))) as { transcript?: string; error?: string };
        if (res.ok && data.transcript) {
          setTranscript(data.transcript);
          setInputMode("voice");
          setNotice(null);
          setStage("review");
          return;
        }
        if (data.error === "stt_unavailable") {
          switchToTyped("Speech-to-text isn't configured on this server yet, so type what you said below.");
          return;
        }
        if (data.error === "no_speech") {
          setError("We couldn't hear any speech in that recording. Try again a little closer to the microphone, or type instead.");
          setStage("intro");
          return;
        }
        setError("Transcription failed. You can retry the recording or type your explanation.");
        setStage("intro");
      } catch {
        setError("Could not reach the transcription service. Check your connection, retry, or type instead.");
        setStage("intro");
      }
    },
    [switchToTyped]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    setNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        stopStream();
        if (blob.size < 1000) {
          setError("That recording was too short. Hold the button a little longer, or type instead.");
          setStage("intro");
          return;
        }
        void transcribe(blob);
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setSeconds(0);
      setStage("recording");
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS && recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      stopStream();
      setError(describeMicError(err));
      setStage("intro");
    }
  }, [stopStream, transcribe]);

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") rec.stop();
    else stopStream();
  }, [stopStream]);

  const analyze = useCallback(async () => {
    const text = transcript.trim();
    if (text.length < 8) {
      setError("Add a sentence or two so the tutor has something to assess.");
      return;
    }
    setError(null);
    setStage("analyzing");
    try {
      const res = await fetch("/api/teachback/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, transcript: text, priorMastery }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        analysis?: TeachBackAnalysis;
        source?: "llama" | "fallback";
        error?: string;
      };
      if (!res.ok || !data.analysis) {
        setError("The tutor couldn't analyze that explanation. Please try again.");
        setStage("review");
        return;
      }
      setAnalysis(data.analysis);
      setSource(data.source ?? "llama");
      if (conceptTag) {
        const entry = recordTeachBackSession(conceptTag, {
          lessonId,
          masteryScore: data.analysis.masteryScore,
          misconceptions: data.analysis.misconceptions,
          teachingStrategy: data.analysis.teachingStrategy,
        });
        setNewMastery(entry.score);
      } else {
        setNewMastery(data.analysis.masteryScore);
      }
      playSound(data.analysis.masteryScore >= 50 ? "correct" : "complete");
      setStage("results");
    } catch {
      setError("Could not reach the tutor. Check your connection and try again.");
      setStage("review");
    }
  }, [transcript, lessonId, priorMastery, conceptTag]);

  const reset = useCallback(() => {
    setStage("intro");
    setTranscript("");
    setAnalysis(null);
    setError(null);
    setNotice(null);
    setNewMastery(null);
    if (conceptTag) setPriorMastery(getConceptMastery(conceptTag));
    if (!micSupported) setInputMode("typed");
  }, [conceptTag, micSupported]);

  const busy = stage === "recording" || stage === "transcribing" || stage === "analyzing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teachback-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="teachback-pop relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-100">Teach It Back · {conceptLabel}</p>
            <h2 id="teachback-title" className="mt-1 text-xl font-bold sm:text-2xl">
              {stage === "results" ? "Your tutor's feedback" : "Explain it in your own words"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          {stage === "results" && analysis ? (
            <TeachBackResults
              analysis={analysis}
              source={source}
              priorMastery={priorMastery}
              profileMastery={newMastery}
              transcript={transcript}
              onRetry={reset}
              onDone={onClose}
            />
          ) : (
            <>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Your prompt</p>
                <p className="mt-1 text-base leading-7 text-slate-800">{prompt}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Teach it like you would to a friend. The tutor is looking for what you understand, not perfect wording.
                </p>
              </div>

              {notice && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
                  {notice}
                </p>
              )}
              {error && (
                <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                  {error}
                </p>
              )}

              {stage === "intro" && (
                <div className="mt-6 flex flex-col items-center gap-4">
                  {micSupported && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="group flex min-h-14 items-center gap-3 rounded-full bg-indigo-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/40"
                    >
                      <MicIcon className="h-5 w-5" />
                      Start recording
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => switchToTyped()}
                    className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
                  >
                    {micSupported ? "Type instead" : "Type your explanation"}
                  </button>
                </div>
              )}

              {stage === "recording" && (
                <div className="mt-6 flex flex-col items-center gap-4" aria-live="polite">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <span className="teachback-pulse absolute inset-0 rounded-full bg-rose-400/40" />
                    <span className="teachback-pulse absolute inset-2 rounded-full bg-rose-400/50 [animation-delay:300ms]" />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                      <MicIcon className="h-7 w-7" />
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Listening… <span className="tabular-nums text-slate-500">{formatTime(seconds)}</span>
                    <span className="text-slate-400"> / {formatTime(MAX_RECORDING_SECONDS)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="min-h-12 rounded-full bg-slate-900 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Stop and transcribe
                  </button>
                </div>
              )}

              {(stage === "transcribing" || stage === "analyzing") && (
                <div className="mt-8 flex flex-col items-center gap-3 text-center" aria-live="polite">
                  <Spinner />
                  <p className="text-base font-semibold text-slate-800">
                    {stage === "transcribing" ? "Turning your speech into text…" : "Your tutor is thinking…"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {stage === "transcribing"
                      ? "Deepgram is transcribing your recording."
                      : "Checking what you understood, spotting misconceptions, and choosing how to help."}
                  </p>
                </div>
              )}

              {stage === "review" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="teachback-transcript" className="text-sm font-semibold text-slate-800">
                      {inputMode === "voice" ? "Here's what we heard" : "Your explanation"}
                    </label>
                    {inputMode === "voice" && (
                      <span className="text-xs text-slate-500">Fix any words the transcript got wrong.</span>
                    )}
                  </div>
                  <textarea
                    id="teachback-transcript"
                    ref={textareaRef}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={5}
                    placeholder="A qubit is…"
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-base leading-7 text-slate-900 shadow-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                  <div className="mt-4 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {micSupported && (
                        <button
                          type="button"
                          onClick={() => {
                            setTranscript("");
                            void startRecording();
                          }}
                          className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                        >
                          {inputMode === "voice" ? "Re-record" : "Record instead"}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={analyze}
                      disabled={transcript.trim().length < 8}
                      className="min-h-12 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Get my feedback
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="relative h-14 w-14">
      <span className="absolute inset-0 rounded-full border-4 border-indigo-100" />
      <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
    </div>
  );
}
