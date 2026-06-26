"use client";

/**
 * Lightweight 2D projection of the Bloch sphere for a single pure qubit state
 * |psi> = cos(theta/2)|0> + e^{i*phi} sin(theta/2)|1>.
 *
 * Projection (z up): screenX = cx + R*x, screenY = cy - R*z + R*k*y, where
 * (x,y,z) = (sin th cos ph, sin th sin ph, cos th). Poles are |0> (top) and
 * |1> (bottom); the equator (theta = 90 deg) is the set of equal superpositions.
 */
export default function BlochSphere({
  theta,
  phi,
  size = 220,
}: {
  /** Polar angle in radians, 0 (|0>) to PI (|1>). */
  theta: number;
  /** Azimuth in radians, 0 to 2*PI (relative phase). */
  phi: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const k = 0.45; // vertical foreshortening of the equatorial plane

  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  const px = cx + r * x;
  const py = cy - r * z + r * k * y;
  const tipInFront = y >= 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-56 w-56"
      role="img"
      aria-label={`Bloch sphere with the state vector at theta ${Math.round(
        (theta * 180) / Math.PI
      )} degrees and phi ${Math.round((phi * 180) / Math.PI)} degrees.`}
    >
      <circle cx={cx} cy={cy} r={r} className="fill-slate-50 stroke-slate-300" strokeWidth={1.5} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={r}
        ry={r * k}
        className="fill-none stroke-slate-300"
        strokeDasharray="4 3"
        strokeWidth={1}
      />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} className="stroke-slate-200" strokeWidth={1} />

      <text x={cx} y={cy - r - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-semibold">
        |0⟩
      </text>
      <text x={cx} y={cy + r + 14} textAnchor="middle" className="fill-slate-500 text-[11px] font-semibold">
        |1⟩
      </text>
      <text x={cx + r + 2} y={cy + 4} textAnchor="start" className="fill-slate-400 text-[10px]">
        |+⟩
      </text>
      <text x={cx - r - 2} y={cy + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
        |−⟩
      </text>

      <line
        x1={cx}
        y1={cy}
        x2={px}
        y2={py}
        className="stroke-indigo-600"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={2.5} className="fill-slate-400" />
      <circle
        cx={px}
        cy={py}
        r={6}
        className={tipInFront ? "fill-indigo-600" : "fill-indigo-300"}
        stroke="white"
        strokeWidth={1.5}
      />
    </svg>
  );
}
