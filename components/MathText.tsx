import { Fragment, type ReactNode } from "react";
import { InlineMath as KInlineMath, BlockMath as KBlockMath } from "react-katex";

/**
 * KaTeX-backed math rendering.
 *
 * - `InlineMath` / `BlockMath` typeset a single LaTeX expression with KaTeX.
 * - `MathText` renders a body string and typesets only the delimited math:
 *   inline with \( ... \) or $ ... $, and block (display) with \[ ... \] or $$ ... $$.
 *   Text outside the delimiters renders unchanged, so MathText is safe to wrap around any string.
 *
 * Authors should write standard LaTeX inside the delimiters, e.g.
 *   "the state \( |\psi\rangle = \alpha|0\rangle + \beta|1\rangle \)".
 * A small input normalizer also accepts Unicode shorthand (|0⟩, θ, √, …) so
 * existing lesson content renders correctly; real LaTeX passes through untouched.
 *
 * Undelimited ket/brace notation in tower bank copy (e.g. |0\rangle) is auto-wrapped
 * before parsing so static challenges typeset without editing every string.
 *
 * Future notation (Pauli matrices, tensor products, inner products, expectation
 * values, …) works automatically because KaTeX handles the full LaTeX surface.
 */

const UNICODE_TO_LATEX: [RegExp, string][] = [
  [/⟩/g, "\\rangle "],
  [/⟨/g, "\\langle "],
  [/ψ/g, "\\psi "],
  [/θ/g, "\\theta "],
  [/φ/g, "\\phi "],
  [/α/g, "\\alpha "],
  [/β/g, "\\beta "],
  [/γ/g, "\\gamma "],
  [/λ/g, "\\lambda "],
  [/π/g, "\\pi "],
  [/√/g, "\\sqrt "],
  [/→/g, "\\to "],
  [/·/g, "\\cdot "],
  [/×/g, "\\times "],
  [/⊗/g, "\\otimes "],
  [/±/g, "\\pm "],
  [/≈/g, "\\approx "],
  [/≥/g, "\\ge "],
  [/≤/g, "\\le "],
  [/−/g, "-"],
  [/°/g, "^{\\circ}"],
  [/²/g, "^2"],
  [/½/g, "\\tfrac12 "],
];

/** Accept Unicode shorthand; leave real LaTeX (backslash commands) untouched. */
function toLatex(expr: string): string {
  let out = expr;
  for (const [re, replacement] of UNICODE_TO_LATEX) out = out.replace(re, replacement);
  // Upright trig operators when written bare (not already \cos / \sin).
  out = out.replace(/(?<!\\)\bcos\b/g, "\\cos").replace(/(?<!\\)\bsin\b/g, "\\sin");
  return out;
}

export function InlineMath({ children }: { children: string }) {
  return <KInlineMath math={toLatex(children)} renderError={() => <span>{children}</span>} />;
}

export function BlockMath({ children }: { children: string }) {
  return (
    <span className="my-2 block max-w-full overflow-x-auto">
      <KBlockMath math={toLatex(children)} renderError={() => <span>{children}</span>} />
    </span>
  );
}

/** Delimiters in priority order: $$, $, \[ \], \( \). */
const DELIMITER = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;

/** Isolated kets: |0\\rangle, |0⟩, |00\\rangle, … — regex literals only (grouped label avoids alternation bugs). */
const ISOLATED_KET = /\|(?:[0-9+\-]+|[a-zA-Zψφθαβγλπ]+)[ \t]*(?:\\rangle|⟩)/g;
/** (|0\\rangle+|1\\rangle)/\\sqrt2 style amplitude sums. */
const AMPLITUDE_SUM =
  /\((?:\|(?:[0-9+\-]+|[a-zA-Zψφθαβγλπ]+)[ \t]*(?:\\rangle|⟩)(?:[ \t]*[+\-][ \t]*\|(?:[0-9+\-]+|[a-zA-Zψφθαβγλπ]+)[ \t]*(?:\\rangle|⟩))+)\)[ \t]*\/[ \t]*\\sqrt(?:\{[^}]+\}|\d+)/g;
/** -|1\\rangle phase-flipped states. */
const PHASE_FLIPPED = /-\|(?:[0-9+\-]+|[a-zA-Zψφθαβγλπ]+)[ \t]*(?:\\rangle|⟩)/g;

function isInsideInlineMath(text: string, offset: number): boolean {
  const before = text.slice(0, offset);
  const opens = (before.match(/\\\(/g) ?? []).length;
  const closes = (before.match(/\\\)/g) ?? []).length;
  return opens > closes;
}

function replaceOutsideInlineMath(
  text: string,
  pattern: RegExp,
  replacer: (match: string) => string
): string {
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return text.replace(re, (match, ...args) => {
    const offset = args[args.length - 2] as number;
    if (isInsideInlineMath(text, offset)) return match;
    return replacer(match);
  });
}

function normalizeKetInner(inner: string): string {
  return inner.replace(/⟩/g, "\\rangle").replace(/[ \t]+\\rangle$/, "\\rangle");
}

function latexKet(inner: string): string {
  return `\\(|${normalizeKetInner(inner)}\\)`;
}

/** Fix author strings where \\r in \\rangle was stored as a carriage return. */
function normalizeKetEscapes(text: string): string {
  return text.replace(/\|([0-9+\-]+)\rangle/g, "|$1\\rangle");
}

/** Wrap common undelimited quantum notation so KaTeX can typeset tower bank copy. */
function wrapImplicitMath(text: string): string {
  if (!text) return text;
  let out = normalizeKetEscapes(text);

  // (|0\rangle+|1\rangle)/\sqrt2 style amplitude sums.
  out = out.replace(AMPLITUDE_SUM, (m) => `\\(${m.replace(/⟩/g, "\\rangle")}\\)`);

  // -|1\rangle phase-flipped states.
  out = out.replace(PHASE_FLIPPED, (m) => `\\(${m.replace(/⟩/g, "\\rangle")}\\)`);

  // Isolated kets: |0\rangle, |0⟩, |00\rangle, …
  out = replaceOutsideInlineMath(out, ISOLATED_KET, (m) => latexKet(m.slice(1)));

  // \sqrt{2}, \sqrt2
  out = replaceOutsideInlineMath(out, /\\sqrt(?:\{[^}]+\}|\d+)/, (m) => `\\(${m}\\)`);

  // Standalone LaTeX commands (\pi phase, \otimes, …).
  out = replaceOutsideInlineMath(
    out,
    /\\(pi|alpha|beta|theta|phi|gamma|lambda|otimes|cdot|pm|approx|ge|le|cos|sin|to)\b/,
    (m) => `\\(${m}\\)`
  );

  return out;
}

/** Auto-wrap bare math in plain-text regions; leave already-delimited spans untouched. */
function preprocessMathText(input: string): string {
  const chunks: string[] = [];
  let last = 0;
  for (const m of input.matchAll(DELIMITER)) {
    const idx = m.index ?? 0;
    if (idx > last) chunks.push(wrapImplicitMath(input.slice(last, idx)));
    chunks.push(m[0]);
    last = idx + m[0].length;
  }
  if (last < input.length) chunks.push(wrapImplicitMath(input.slice(last)));
  return chunks.join("");
}

function segmentExpr(m: RegExpMatchArray): string {
  return (m[1] ?? m[2] ?? m[3] ?? m[4] ?? "").trim();
}

function segmentBlock(m: RegExpMatchArray): boolean {
  return m[1] !== undefined || m[3] !== undefined;
}

export default function MathText({ children }: { children: string }) {
  const source = preprocessMathText(children);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const m of source.matchAll(DELIMITER)) {
    const idx = m.index ?? 0;
    if (idx > lastIndex) {
      nodes.push(<Fragment key={`t${key}`}>{source.slice(lastIndex, idx)}</Fragment>);
    }
    const expr = segmentExpr(m);
    if (segmentBlock(m)) {
      nodes.push(<BlockMath key={`b${key}`}>{expr}</BlockMath>);
    } else {
      nodes.push(<InlineMath key={`i${key}`}>{expr}</InlineMath>);
    }
    key += 1;
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < source.length) {
    nodes.push(<Fragment key={`t${key}`}>{source.slice(lastIndex)}</Fragment>);
  }
  return <>{nodes}</>;
}
