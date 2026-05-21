/**
 * Agentic Fantasy Football OS — brand logo.
 *
 * The mark is a football panel drawn as a passing/agent network: a neon "agent"
 * node sits at the centre, wired to the players on the pentagon's vertices — the
 * captain lit in gold. Squad orchestrated by an agent, on-chain, in one glyph.
 * Inline SVG, no network cost.
 *
 *   <LogoMark />                icon only
 *   <LogoLockup />              icon + "FantasyFC OS" wordmark
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

// Pentagon (football panel) — centre + 5 vertices on a 64×64 grid.
const CENTER: [number, number] = [32, 32];
const VERTS: [number, number][] = [
  [32, 12], // top — captain
  [51, 26],
  [44, 48],
  [20, 48],
  [13, 26],
];

// Spokes (centre → vertex) then the pentagon perimeter.
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

type NodeRole = "agent" | "captain" | "player" | "accent" | "dim";
const NODES: { x: number; y: number; r: number; role: NodeRole }[] = [
  { x: 32, y: 32, r: 4.6, role: "agent" },
  { x: 32, y: 12, r: 3.6, role: "captain" },
  { x: 51, y: 26, r: 3.0, role: "player" },
  { x: 44, y: 48, r: 3.0, role: "accent" },
  { x: 20, y: 48, r: 3.0, role: "player" },
  { x: 13, y: 26, r: 2.8, role: "dim" },
];

const COLORS = {
  neon: "#3ef08b",
  gold: "#ffd35c",
  electric: "#2dd4ff",
  white: "#e9fff4",
};

function paint(role: NodeRole, variant: Variant) {
  if (variant === "mono") {
    const c = "currentColor";
    const op =
      role === "dim" ? 0.45 : role === "player" || role === "accent" ? 0.85 : 1;
    return { fill: c, opacity: op };
  }
  switch (role) {
    case "agent":
      return { fill: COLORS.neon, opacity: 1 };
    case "captain":
      return { fill: COLORS.gold, opacity: 1 };
    case "accent":
      return { fill: COLORS.electric, opacity: 1 };
    case "player":
      return { fill: COLORS.white, opacity: 1 };
    case "dim":
      return { fill: COLORS.white, opacity: 0.45 };
  }
}

export function LogoMark({
  size = 40,
  className = "",
  variant = "color",
  title = "Agentic Fantasy Football OS",
}: MarkProps) {
  const line = variant === "mono" ? "currentColor" : COLORS.neon;
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
      {/* ball curvature */}
      <circle
        cx={32}
        cy={32}
        r={27}
        fill="none"
        stroke={line}
        strokeWidth={1.4}
        opacity={variant === "mono" ? 0.3 : 0.22}
      />
      {/* passing / formation network */}
      <g
        stroke={line}
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={variant === "mono" ? 0.5 : 0.45}
      >
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      {/* nodes */}
      <g>
        {NODES.map((n, i) => {
          const p = paint(n.role, variant);
          return (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={p.fill}
              opacity={p.opacity}
            />
          );
        })}
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
          className="font-display font-bold tracking-tight"
          style={{ fontSize: markSize * 0.5 }}
        >
          Fantasy
          <span style={{ color: variant === "mono" ? "currentColor" : COLORS.neon }}>
            FC
          </span>{" "}
          OS
        </div>
        {withTagline && (
          <div
            className="mt-1.5 font-mono uppercase tracking-[0.18em] opacity-50"
            style={{ fontSize: markSize * 0.16 }}
          >
            agentic fantasy football · X Layer
          </div>
        )}
      </div>
    </div>
  );
}
