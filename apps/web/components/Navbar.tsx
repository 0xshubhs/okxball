"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import WalletConnect from "./WalletConnect";
import { LogoMark } from "./logo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/squad", label: "Squad" },
  { href: "/players", label: "Players" },
  { href: "/agent", label: "Agent" },
  { href: "/live", label: "Live" },
  { href: "/leaderboard", label: "League" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="transition group-hover:rotate-6">
        <LogoMark size={34} />
      </div>
      <div className="leading-none">
        <div className="font-display text-base font-bold uppercase tracking-tight">
          OK<span className="text-flame">Ball</span>
        </div>
        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-bone">
          Fantasy World Cup · X Layer
        </div>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink-700 bg-ink-950">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3.5 py-2 font-display text-sm font-semibold uppercase tracking-wide transition ${
                  active ? "text-flame" : "text-bone hover:text-cream"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-2.5 -bottom-[18px] h-[3px] bg-flame" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border-2 border-ink-700 text-cream lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-ink-700 px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md border-2 px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wide ${
                  pathname === l.href
                    ? "border-flame bg-flame/10 text-flame"
                    : "border-ink-700 text-bone"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 sm:hidden">
            <WalletConnect />
          </div>
        </div>
      )}
    </header>
  );
}
