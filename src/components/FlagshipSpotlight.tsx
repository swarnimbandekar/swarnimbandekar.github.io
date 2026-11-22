'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '@/data/portfolio';

const TABS = [
  {
    id: 'intercept',
    label: 'Intercept',
    caption: 'Live traffic flow · 127.0.0.1:8080',
    leftTitle: 'Request (edited)',
    leftLines: [
      'POST /api/v2/outing-pass/approve HTTP/2',
      'Host: portal.target.edu',
      'Authorization: Bearer eyJhbGciOiJSUzI1Ni...',
      'Content-Type: application/json',
      '',
      '{',
      '  "student_id": "22BCE9481",',
      '  "pass_id": "PASS-8841",',
      '  "mentor_approved": true,',
      '  "warden_override": true',
      '}',
    ],
    rightTitle: 'Python network engine',
    rightLines: [
      '[+] TLS ALPN negotiated: h2',
      '[+] Intercepted flow #042 before upstream dispatch',
      '[!] Notice: authorization relies on client field `warden_override`',
      '[→] Forwarded modified JSON body',
      '[←] HTTP/2 200 OK · Outing pass PDF issued',
    ],
  },
  {
    id: 'repeater',
    label: 'Repeater',
    caption: 'Single-packet race window · 15 streams',
    leftTitle: 'Concurrent payload burst',
    leftLines: [
      '$ bidoytu-repeater --tab 3 --parallel 15 --single-packet',
      '[00:00.001] 15 HTTP/2 streams staged (final DATA byte held)',
      '[00:00.003] Released final bytes inside single TCP window',
      '[200 OK] #01 coupon_redeemed: true | balance: +500',
      '[200 OK] #02 coupon_redeemed: true | balance: +1000',
      '[200 OK] #03 coupon_redeemed: true | balance: +1500',
    ],
    rightTitle: 'Timing breakdown',
    rightLines: [
      'Window spread: 4.1 ms across 15 parallel workers',
      'Lock state: Server checked `used == false` pre-commit',
      'Result: 15/15 redemptions accepted concurrently',
      'Saved trace to workspace tab #3',
    ],
  },
  {
    id: 'audit',
    label: 'Passive Audit',
    caption: 'Automated response checks',
    leftTitle: 'Detected findings',
    leftLines: [
      '[HIGH] Public JWKS modulus exposed at /.well-known/jwks.json',
      '       RS256 key material paired with weak kid handling',
      '[MED]  Permissive CORS origin reflection with credentials: true',
      '[INFO] Production source map reachable: /static/js/main.js.map',
    ],
    rightTitle: 'Extracted endpoints',
    rightLines: [
      'GET  /api/v1/internal/flags',
      'POST /api/v2/auth/token/refresh',
      'PUT  /api/v2/users/{id}/role',
      'GET  /api/v1/exports/audit-log.csv',
    ],
  },
] as const;

export function FlagshipSpotlight() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('intercept');
  const [hovered, setHovered] = useState(false);
  const [spotlightEnabled, setSpotlightEnabled] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const borderGlow = useMotionTemplate`radial-gradient(460px circle at ${mouseX}px ${mouseY}px, rgba(52, 211, 153, 0.36), transparent 72%)`;
  const surfaceSheen = useMotionTemplate`radial-gradient(560px circle at ${mouseX}px ${mouseY}px, rgba(139, 124, 246, 0.065), transparent 68%)`;

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSpotlightEnabled(canHover && !reduced);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!spotlightEnabled || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const flagship = PROJECTS.find((p) => p.flagship) || PROJECTS[0];
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6" aria-labelledby="flagship-heading">
      <div
        ref={boxRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#0c0c0f] text-zinc-900 dark:text-zinc-100 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)] dark:shadow-2xl transition-colors duration-300"
      >
        <motion.div
          aria-hidden="true"
          style={{
            background: borderGlow,
            opacity: hovered && spotlightEnabled ? 1 : 0,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          className="pointer-events-none absolute -inset-px rounded-3xl p-px transition-opacity duration-300"
        />
        <motion.div
          aria-hidden="true"
          style={{
            background: surfaceSheen,
            opacity: hovered && spotlightEnabled ? 1 : 0,
          }}
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
          {/* Left Narrative */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:text-[#34d399]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-[#34d399]" />
              Featured Build · Open Source
            </div>

            <h2
              id="flagship-heading"
              className="font-display mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white"
            >
              {flagship.title}
            </h2>
            <p className="mt-1.5 font-sans text-sm font-medium text-[var(--accent)]">
              {flagship.tagline}
            </p>

            <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              {flagship.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {flagship.metrics?.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50/90 dark:bg-white/[0.03] px-3.5 py-3"
                >
                  <div className="font-mono text-sm font-semibold text-zinc-950 dark:text-white">
                    {m.value}
                  </div>
                  <div className="mt-0.5 font-sans text-xs text-zinc-500 dark:text-zinc-400">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={flagship.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 dark:bg-[#34d399] px-4.5 py-2.5 font-sans text-xs font-semibold text-white dark:text-zinc-950 transition-transform hover:-translate-y-0.5"
              >
                <span>View on GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-white/15 bg-white dark:bg-transparent px-4.5 py-2.5 font-sans text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:hover:border-white/30 dark:hover:text-white"
              >
                <span>All {PROJECTS.length} projects →</span>
              </Link>
            </div>
          </div>

          {/* Right Interactive Workspace Mock */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-[#09090d] shadow-xl">
              {/* Top Window Bar + Animated Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#111116] px-4 py-2.5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>

                <div className="flex items-center gap-1 rounded-full bg-black/40 p-0.5 border border-white/8" role="tablist">
                  {TABS.map((tab) => {
                    const active = tab.id === activeTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative whitespace-nowrap rounded-full px-2.5 sm:px-3 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                          active ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="bidoytu-tab-pill"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-white/12 border border-white/15"
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <span className="hidden sm:inline font-mono text-[10px] text-[#34d399]">
                  {current.caption}
                </span>
              </div>

              {/* Animated Tab Body */}
              <div className="p-4 sm:p-5 min-h-[265px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="rounded-xl border border-white/8 bg-[#0b0b0f] p-3.5">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        {current.leftTitle}
                      </div>
                      <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap break-words">
                        {current.leftLines.join('\n')}
                      </pre>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-[#0b0b0f] p-3.5">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        {current.rightTitle}
                      </div>
                      <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap break-words">
                        {current.rightLines.join('\n')}
                      </pre>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
