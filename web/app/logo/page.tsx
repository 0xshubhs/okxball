import Link from "next/link";
import { LogoLockup, LogoMark } from "@/components/logo";

export const metadata = {
  title: "Logo · Brand — Agentic Fantasy Football OS",
  description:
    "The FantasyFC OS logo: a football panel drawn as an agent/passing network. Marks, lockups, colors and usage.",
};

export default function LogoPage() {
  return (
    <div className="py-10">
      <header className="mb-12">
        <div className="label-mono mb-3">brand</div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Logo
        </h1>
        <p className="mt-3 max-w-2xl text-white/55">
          The mark is a football panel drawn as a passing network: a neon{" "}
          <span className="text-neon">agent</span> node at the centre wired to the
          players on the pentagon — the captain lit in{" "}
          <span className="text-gold">gold</span>. A squad orchestrated by an
          agent, on-chain, in a single glyph.
        </p>
      </header>

      {/* Primary lockup */}
      <section className="glass mb-10 flex flex-col items-center justify-center gap-6 px-6 py-16">
        <LogoLockup markSize={84} withTagline />
        <div className="flex flex-wrap justify-center gap-3">
          <Download href="/logo-lockup.svg" label="lockup.svg" />
          <Download href="/logo-mark.svg" label="mark.svg" />
        </div>
      </section>

      {/* Variants */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Variants</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch label="Mark · color">
            <LogoMark size={84} />
          </Swatch>
          <Swatch label="Lockup · color">
            <LogoLockup markSize={48} />
          </Swatch>
          <Swatch label="Mark · mono white">
            <span className="text-white">
              <LogoMark size={84} variant="mono" />
            </span>
          </Swatch>
          <Swatch label="Mono · on neon" tone="neon">
            <span className="text-pitch-950">
              <LogoMark size={84} variant="mono" />
            </span>
          </Swatch>
          <Swatch label="Mono · on white" tone="white">
            <span className="text-pitch-950">
              <LogoMark size={84} variant="mono" />
            </span>
          </Swatch>
          <Swatch label="Reversed lockup" tone="neon">
            <span className="flex items-center gap-3 text-pitch-950">
              <LogoMark size={44} variant="mono" />
              <span className="font-display text-2xl font-bold tracking-tight">
                FantasyFC OS
              </span>
            </span>
          </Swatch>
        </div>
      </section>

      {/* Sizing */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Mark at any size</h2>
        <div className="glass flex flex-wrap items-end gap-8 px-6 py-8">
          {[16, 24, 40, 64, 96].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <LogoMark size={s} />
              <span className="font-mono text-[10px] text-white/40">{s}px</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-white/50">
          The six nodes stay legible down to 16px — used as the favicon and nav
          mark.
        </p>
      </section>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Colors</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ColorTile name="neon · agent" hex="#3ef08b" />
          <ColorTile name="gold · captain" hex="#ffd35c" />
          <ColorTile name="electric · accent" hex="#2dd4ff" />
          <ColorTile name="pitch · bg" hex="#020806" />
        </div>
      </section>

      <section className="text-xs text-white/40">
        <Link href="/dashboard" className="hover:text-neon">
          See the brand in context on the dashboard →
        </Link>
      </section>
    </div>
  );
}

function Swatch({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "neon" | "white";
  children: React.ReactNode;
}) {
  const bg =
    tone === "neon" ? "bg-neon" : tone === "white" ? "bg-white" : "bg-white/[0.03]";
  const labelColor = tone ? "text-pitch-950/60" : "text-white/40";
  return (
    <div
      className={`relative flex h-48 items-center justify-center rounded-2xl border border-white/10 ${bg}`}
    >
      <span
        className={`absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.12em] ${labelColor}`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ColorTile({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="glass p-4">
      <div
        className="h-12 w-full rounded-lg border border-white/10"
        style={{ backgroundColor: hex }}
      />
      <div className="mt-2 font-mono text-[11px]">{name}</div>
      <div className="font-mono text-[10px] text-white/40">{hex}</div>
    </div>
  );
}

function Download({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 transition hover:border-neon hover:text-neon"
    >
      ↓ {label}
    </a>
  );
}
