/**
 * OKBall — brand logo (2-colour: red + white).
 *
 * A football panel drawn as an agent network: one red "agent" node at the
 * centre wired to the white squad on the pentagon. Two colours only.
 * Inline SVG, no network cost.
 *
 *   <LogoMark />                icon only
 *   <LogoLockup />              icon + "OKBall" wordmark
 *   <LogoLockup withTagline />  + tagline
 *   variant="mono"             single-colour (uses currentColor)
 */

type Variant = "color" | "mono";

type MarkProps = {
  size?: number;
  className?: string;
  variant?: Variant;
  title?: string;
};

const RED = "#ff2d2d";
const WHITE = "#ffffff";

const CENTER: [number, number] = [32, 32];
const VERTS: [number, number][] = [
  [32, 12],
  [51, 26],
  [44, 48],
  [20, 48],
  [13, 26],
];

const EDGES: [number, number, number, number][] = [
  ...VERTS.map(([x, y]) => [CENTER[0], CENTER[1], x, y] as [number, number, number, number]),
  ...VERTS.map(
    ([x, y], i) =>
      [x, y, VERTS[(i + 1) % VERTS.length][0], VERTS[(i + 1) % VERTS.length][1]] as [
        number,
        number,
        number,
        number,
      ]
  ),
];

// role: "agent" (red) or "node" (white)
const NODES: { x: number; y: number; r: number; agent?: boolean }[] = [
  { x: 32, y: 32, r: 4.8, agent: true },
  { x: 32, y: 12, r: 3.4 },
  { x: 51, y: 26, r: 3.0 },
  { x: 44, y: 48, r: 3.0 },
  { x: 20, y: 48, r: 3.0 },
  { x: 13, y: 26, r: 3.0 },
];

export function LogoMark({
  size = 40,
  className = "",
  variant = "color",
  title = "OKBall",
}: MarkProps) {
  const net = variant === "mono" ? "currentColor" : WHITE;
  const agent = variant === "mono" ? "currentColor" : RED;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={32} cy={32} r={27} fill="none" stroke={net} strokeWidth={1.4} opacity={0.28} />
      <g stroke={net} strokeWidth={1.6} strokeLinecap="round" opacity={0.5}>
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g>
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.agent ? agent : net} />
        ))}
      </g>
    </svg>
  );
}

type LockupProps = MarkProps & {
  withTagline?: boolean;
  markSize?: number;
};

export function LogoLockup({
  className = "",
  variant = "color",
  withTagline = false,
  markSize = 40,
}: LockupProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={markSize} variant={variant} />
      <div className="leading-none">
        <div
          className="font-display font-bold uppercase tracking-tight"
          style={{ fontSize: markSize * 0.5 }}
        >
          OK
          <span style={{ color: variant === "mono" ? "currentColor" : RED }}>Ball</span>
        </div>
        {withTagline && (
          <div
            className="mt-1.5 font-mono uppercase tracking-[0.18em] opacity-50"
            style={{ fontSize: markSize * 0.16 }}
          >
            fantasy world cup · X Layer
          </div>
        )}
      </div>
    </div>
  );
}
