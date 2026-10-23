import type { ReactNode } from "react";

const NODE_STROKE = "#e0d9cd";
const ARROW = "#b45309";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-node`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#faf7f1" />
      </linearGradient>
      <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fdf1e3" />
        <stop offset="100%" stopColor="#f8e3cb" />
      </linearGradient>
      <marker id={`${id}-arrow`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill={ARROW} />
      </marker>
      <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke="rgba(180,83,9,0.06)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}

export function BoardGrid({ id }: { id: string }) {
  return <rect width="100%" height="100%" fill={`url(#${id}-grid)`} />;
}

export function Node({
  id,
  x,
  y,
  w = 140,
  h = 60,
  label,
  accent = false,
}: {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={accent ? `url(#${id}-accent)` : `url(#${id}-node)`}
        stroke={accent ? "#e5b98a" : NODE_STROKE}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 5}
        textAnchor="middle"
        fill={accent ? "#9a3412" : "#3f3f46"}
        fontSize="13"
        fontWeight={accent ? 600 : 400}
        fontFamily="ui-sans-serif, system-ui"
      >
        {label}
      </text>
    </g>
  );
}

export function Edge({
  id,
  d,
  arrow = true,
}: {
  id: string;
  d: string;
  arrow?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={ARROW}
      strokeWidth="2"
      markerEnd={arrow ? `url(#${id}-arrow)` : undefined}
    />
  );
}

/** A labelled tablet/browser frame containing an SVG board scene. */
export function BoardFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-white " +
        (className ?? "")
      }
    >
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-yellow-400/70" />
        <span className="size-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 truncate font-mono text-[10px] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden bg-white">{children}</div>
    </div>
  );
}

/** The onboarding flow scene reused on the landing hero + showcase. */
export function FlowScene({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <Defs id={id} />
      <BoardGrid id={id} />
      <Node id={id} x={40} y={150} w={130} label="Start" />
      <Node id={id} x={230} y={60} w={150} label="Sign up" />
      <Node id={id} x={230} y={240} w={150} label="Explore" />
      <Node id={id} x={450} y={150} w={150} label="Create board" accent />
      <Edge id={id} d="M170 180 C 200 180 200 90 230 90" />
      <Edge id={id} d="M170 180 C 200 180 200 270 230 270" arrow={false} />
      <Edge id={id} d="M380 90 C 410 90 410 180 450 180" />
      <Edge id={id} d="M380 270 C 410 270 410 180 450 180" arrow={false} />
    </svg>
  );
}

/** Architecture / service-map scene. */
export function ArchitectureScene({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <Defs id={id} />
      <BoardGrid id={id} />
      <Node id={id} x={250} y={20} w={140} label="Client" />
      <Node id={id} x={40} y={150} w={150} label="API Gateway" accent />
      <Node id={id} x={250} y={150} w={140} label="Auth" />
      <Node id={id} x={440} y={150} w={150} label="Postgres" />
      <Node id={id} x={40} y={270} w={150} label="Gemini" />
      <Node id={id} x={440} y={270} w={150} label="Storage" />
      <Edge id={id} d="M320 80 L 115 150" />
      <Edge id={id} d="M115 210 L 250 180" />
      <Edge id={id} d="M115 210 L 440 180" />
      <Edge id={id} d="M115 210 L 115 270" arrow={false} />
      <Edge id={id} d="M320 210 L 440 270" />
    </svg>
  );
}

/** Web mockup wireframe scene. */
export function WebMockupScene({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <Defs id={id} />
      <BoardGrid id={id} />
      <rect x="60" y="40" width="520" height="280" rx="14" fill="#fff" stroke={NODE_STROKE} />
      <rect x="60" y="40" width="520" height="44" rx="14" fill="#fafafa" />
      <circle cx="90" cy="62" r="6" fill="#f87171" />
      <circle cx="110" cy="62" r="6" fill="#fbbf24" />
      <circle cx="130" cy="62" r="6" fill="#4ade80" />
      <rect x="90" y="110" width="220" height="20" rx="6" fill="#e8e1d5" />
      <rect x="90" y="146" width="300" height="12" rx="6" fill="#f3eee5" />
      <rect x="90" y="168" width="260" height="12" rx="6" fill="#f3eee5" />
      <rect x="90" y="204" width="120" height="34" rx="9" fill="#b45309" />
      <rect x="360" y="110" width="190" height="140" rx="12" fill={`url(#${id}-accent)`} stroke="#e5b98a" />
      <rect x="90" y="266" width="140" height="34" rx="10" fill="#fff" stroke={NODE_STROKE} />
      <rect x="250" y="266" width="140" height="34" rx="10" fill="#fff" stroke={NODE_STROKE} />
    </svg>
  );
}

/** Mobile mockup scene — two phone frames. */
export function MobileMockupScene({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <Defs id={id} />
      <BoardGrid id={id} />
      <rect x="150" y="30" width="150" height="300" rx="24" fill="#fff" stroke={NODE_STROKE} />
      <rect x="340" y="30" width="150" height="300" rx="24" fill="#fff" stroke={NODE_STROKE} />
      <rect x="205" y="44" width="40" height="6" rx="3" fill="#e8e1d5" />
      <rect x="395" y="44" width="40" height="6" rx="3" fill="#e8e1d5" />
      <rect x="170" y="80" width="110" height="14" rx="6" fill="#e8e1d5" />
      <rect x="170" y="106" width="110" height="60" rx="10" fill={`url(#${id}-accent)`} stroke="#e5b98a" />
      <rect x="170" y="180" width="110" height="10" rx="5" fill="#f3eee5" />
      <rect x="170" y="200" width="80" height="10" rx="5" fill="#f3eee5" />
      <rect x="170" y="240" width="110" height="34" rx="9" fill="#b45309" />
      <rect x="360" y="80" width="110" height="14" rx="6" fill="#e8e1d5" />
      <circle cx="415" cy="160" r="42" fill={`url(#${id}-accent)`} stroke="#e5b98a" />
      <rect x="360" y="220" width="110" height="10" rx="5" fill="#f3eee5" />
      <rect x="360" y="240" width="110" height="34" rx="9" fill="#b45309" />
    </svg>
  );
}

/** Mindmap scene — radial nodes. */
export function MindmapScene({ id }: { id: string }) {
  const cx = 320;
  const cy = 180;
  const branches = [
    { label: "Idea", x: 130, y: 90 },
    { label: "Design", x: 130, y: 270 },
    { label: "Build", x: 510, y: 90 },
    { label: "Ship", x: 510, y: 270 },
  ];
  return (
    <svg viewBox="0 0 640 360" className="absolute inset-0 h-full w-full" aria-hidden>
      <Defs id={id} />
      <BoardGrid id={id} />
      {branches.map((b) => (
        <Edge
          key={b.label}
          id={id}
          d={`M${cx} ${cy} C ${(cx + b.x) / 2} ${cy} ${(cx + b.x) / 2} ${b.y} ${b.x} ${b.y}`}
          arrow={false}
        />
      ))}
      {branches.map((b) => (
        <Node key={b.label} id={id} x={b.x - 60} y={b.y - 24} w={120} h={48} label={b.label} />
      ))}
      <Node id={id} x={cx - 80} y={cy - 30} w={160} h={60} label="AI Whiteboard" accent />
    </svg>
  );
}

export const SCENES: Record<string, (p: { id: string }) => ReactNode> = {
  flow: FlowScene,
  architecture: ArchitectureScene,
  web: WebMockupScene,
  mobile: MobileMockupScene,
  mindmap: MindmapScene,
};
