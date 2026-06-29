import { getLesson } from "@/content/lessons";
import { getTowerHintContext, getTowerLessonContext, type HintRequest } from "./tower-context";

export type PageKind = "dashboard" | "lesson" | "tower" | "profile" | "auth" | "home" | "other";

/** Map a pathname to the coarse page the learner is on. */
export function pageKindFromPath(pathname: string): PageKind {
  if (pathname.startsWith("/lessons/")) return "lesson";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/tower")) return "tower";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname === "/login" || pathname === "/signup") return "auth";
  if (pathname === "/") return "home";
  return "other";
}

/** Extract the lesson id from `/lessons/[lessonId]` routes. */
export function lessonIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/lessons\/([^/?#]+)/);
  return match?.[1] ?? null;
}

/** Topic string for fun facts and practice grounded in the current page. */
export function aiTopicForPage(pathname: string): string {
  const lessonId = lessonIdFromPath(pathname);
  if (lessonId) {
    const lesson = getLesson(lessonId);
    if (lesson) return lesson.title;
  }
  const towerLesson = getTowerLessonContext();
  if (towerLesson?.lessonTitle) return towerLesson.lessonTitle;
  return "quantum computing";
}

/**
 * Hint payload for the summon-button AI call. Prefers a saved wrong-answer
 * context when it matches the current lesson; otherwise builds page-appropriate
 * guidance so dashboard hints never reference a specific step prompt.
 */
export function hintContextForPage(pathname: string): HintRequest | null {
  const kind = pageKindFromPath(pathname);
  const saved = getTowerHintContext();

  if (kind === "lesson") {
    const lessonId = lessonIdFromPath(pathname);
    const lesson = lessonId ? getLesson(lessonId) : null;
    if (!lesson) return null;
    if (saved?.lessonId === lessonId && saved.prompt) {
      return {
        lessonTitle: saved.lessonTitle ?? lesson.title,
        prompt: saved.prompt,
        selectedWrong: saved.selectedWrong,
        correctAnswer: saved.correctAnswer,
        feedback: saved.feedback,
        conceptTag: saved.conceptTag,
      };
    }
    return {
      lessonTitle: lesson.title,
      prompt: `The apprentice is studying "${lesson.title}" and asked for guidance on the current step.`,
    };
  }

  if (kind === "dashboard") {
    const recent = getTowerLessonContext();
    return {
      lessonTitle: recent?.lessonTitle ?? "quantum computing fundamentals",
      prompt:
        "The apprentice is on the course dashboard. Offer a short retrieval cue about their next study move — not a specific lesson answer.",
    };
  }

  if (kind === "profile") {
    return {
      lessonTitle: "learning progress",
      prompt:
        "The apprentice is reviewing their wizard profile, streak, and relics. Offer a brief encouragement about consistency or reflection — not a lesson answer.",
    };
  }

  if (kind === "tower" && saved?.prompt) {
    return {
      lessonTitle: saved.lessonTitle,
      prompt: saved.prompt,
      selectedWrong: saved.selectedWrong,
      correctAnswer: saved.correctAnswer,
      feedback: saved.feedback,
      conceptTag: saved.conceptTag,
    };
  }

  return saved;
}
