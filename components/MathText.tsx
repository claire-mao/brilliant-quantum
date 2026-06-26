import { Fragment, type ReactNode } from "react";
import { InlineMath as KInlineMath, BlockMath as KBlockMath } from "react-katex";

/**
 * KaTeX-backed math rendering.
 *
 * - `InlineMath` / `BlockMath` typeset a single LaTeX expression with KaTeX.
 * - `MathText` renders a body string and typesets only the delimited math:
 *   inline with \( ... \) and block (display) with \[ ... \]. Text outside the
 *   delimiters renders unchanged, so MathText is safe to wrap around any string.
 *
 * Authors should write standard LaTeX inside the delimiters, e.g.
 *   "the state \( |\psi\rangle = \alpha|0\rangle + \beta|1\rangle \)".
 * A small input normalizer also accepts Unicode shorthand (|0⟩, θ, √, …) so
 * existing lesson content renders correctly; real LaTeX passes through untouched.
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

const SEGMENT = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;

export default function MathText({ children }: { children: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const m of children.matchAll(SEGMENT)) {
    const idx = m.index ?? 0;
    if (idx > lastIndex) {
      nodes.push(<Fragment key={`t${key}`}>{children.slice(lastIndex, idx)}</Fragment>);
    }
    if (m[1] !== undefined) {
      nodes.push(<BlockMath key={`b${key}`}>{m[1].trim()}</BlockMath>);
    } else {
      nodes.push(<InlineMath key={`i${key}`}>{(m[2] ?? "").trim()}</InlineMath>);
    }
    key += 1;
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < children.length) {
    nodes.push(<Fragment key={`t${key}`}>{children.slice(lastIndex)}</Fragment>);
  }
  return <>{nodes}</>;
}
