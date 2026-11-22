'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  Check,
  Copy,
  Lock,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import type { CveItem, HallOfFameItem } from '@/data/portfolio';

interface HallOfFameSectionProps {
  items: HallOfFameItem[];
  cves: CveItem[];
}

function getInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (words.length === 0) return 'HOF';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const SEVERITY_STYLES: Record<CveItem['severity'], string> = {
  Critical:
    'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  High: 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]',
  Medium:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Low: 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)]',
};

function SpotlightSurface({
  children,
  canHover,
  className = '',
  dashed = false,
}: {
  children: React.ReactNode;
  canHover: boolean;
  className?: string;
  dashed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);

  const spotlightBorder = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, var(--accent-border), transparent 72%)`;
  const spotlightSurface = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, var(--spotlight-sheen), transparent 68%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-xl border ${
        dashed ? 'border-dashed border-[var(--border-strong)]' : 'border-[var(--border)]'
      } bg-[var(--bg-elevated)] transition-colors duration-300 hover:border-[var(--border-strong)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl p-px transition-opacity duration-300"
        style={{ opacity: hovered && canHover ? 1 : 0 }}
      >
        <motion.div
          style={{
            background: spotlightBorder,
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          className="h-full w-full rounded-xl p-px"
        />
      </div>

      <motion.div
        aria-hidden="true"
        style={{
          background: spotlightSurface,
          opacity: hovered && canHover ? 1 : 0,
        }}
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function LogoTile({
  item,
  canHover,
}: {
  item: HallOfFameItem;
  canHover: boolean;
}) {
  const isExternal = item.url?.startsWith('http');

  const content = (
    <SpotlightSurface
      canHover={canHover}
      dashed={item.confidential}
      className="h-full px-3.5 py-3.5 sm:px-4 sm:py-4 flex flex-col justify-between"
    >
      {/* Top Row: Logo Mark + Verified Shield / Link */}
      <div className="flex items-start justify-between gap-2">
        {item.logo && item.wideLogo ? (
          <div className="flex h-10 items-center">
            <img
              src={item.logo}
              alt={`${item.name} logo`}
              loading="lazy"
              className={`max-h-5 max-w-[96px] sm:max-w-[116px] w-auto object-contain opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-[1.03] ${
                item.invertOnDark ? 'dark:invert' : ''
              } ${item.invertOnLight ? 'invert dark:invert-0' : ''}`}
            />
          </div>
        ) : item.logo ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 dark:bg-white/[0.93] p-1.5 ring-1 ring-black/8 dark:ring-white/15 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <img
              src={item.logo}
              alt={`${item.name} logo`}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ) : item.confidential ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
            <Lock className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] font-mono text-xs font-bold tracking-wider text-[var(--text-primary)] transition-colors group-hover:border-[var(--accent-border)] group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
            {getInitials(item.name)}
          </div>
        )}

        {item.url ? (
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--mint)] opacity-75 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      {/* Bottom Meta */}
      <div className="mt-3.5 pt-2.5 border-t border-[var(--border)]">
        <div className="truncate font-display text-[13.5px] font-bold tracking-[-0.015em] text-[var(--text-primary)]">
          {item.name}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-1.5 font-mono text-[10px]">
          <span className="shrink-0 text-[var(--mint)]">{item.acknowledgment}</span>
          {item.tag && (
            <span className="truncate text-[var(--text-muted)]">{item.tag}</span>
          )}
        </div>
      </div>
    </SpotlightSurface>
  );

  if (item.url) {
    if (isExternal) {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl"
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={item.url}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function CveCard({ cve, canHover }: { cve: CveItem; canHover: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cve.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <SpotlightSurface
      canHover={canHover}
      className="h-full p-4 sm:p-5 flex flex-col justify-between"
    >
      <div>
        {/* CVE ID + Severity */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mint)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--mint)]" />
            </span>
            <span className="font-mono text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {cve.id}
            </span>
          </div>

          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${SEVERITY_STYLES[cve.severity]}`}
          >
            {cve.cvss ? `${cve.severity} · ${cve.cvss}` : cve.severity}
          </span>
        </div>

        {/* Title & Product */}
        <h3 className="font-display mt-3 text-[15px] font-semibold leading-snug tracking-[-0.015em] text-[var(--text-primary)]">
          {cve.title}
        </h3>
        <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
          {cve.product}
        </p>

        {/* Optional CWE / Status pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          <span className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[var(--mint)]">
            {cve.status} · {cve.year}
          </span>
          {cve.cwe && (
            <span className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[var(--text-muted)]">
              {cve.cwe}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label={`Copy ${cve.id}`}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[var(--mint)]" />
              <span className="text-[var(--mint)]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy ID</span>
            </>
          )}
        </button>

        {cve.advisoryUrl && (
          <a
            href={cve.advisoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[var(--accent)] hover:underline"
          >
            <span>CVE Record</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </SpotlightSurface>
  );
}

export function HallOfFameSection({ items, cves }: HallOfFameSectionProps) {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <section
      className="mx-auto mt-16 sm:mt-24 max-w-6xl px-4 sm:px-6"
      aria-labelledby="hof-heading"
    >
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-3 sm:gap-4 border-b border-[var(--border)] pb-4 sm:pb-5">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
            02 · Hall of Fame &amp; CVEs
          </div>
          <h2
            id="hof-heading"
            className="font-display mt-1.5 text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-[var(--text-primary)]"
          >
            Secured organizations &amp; CVEs
          </h2>
        </div>

        {/* Summary Metric Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 font-medium text-[var(--accent)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{items.length} Organizations Secured</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mint)]/30 bg-[var(--mint-soft)] px-3 py-1 font-medium text-[var(--mint)]">
            <Award className="h-3.5 w-3.5" />
            <span>{cves.length} CVEs Assigned</span>
          </span>
        </div>
      </div>

      {/* Unified Architectural Container */}
      <div className="surface-card overflow-hidden rounded-2xl">
        {/* Part A: Hall of Fame Logo Wall */}
        <div className="p-4 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>Hall of Fame · Companies Secured</span>
            </div>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              Responsible Disclosures &amp; Bug Bounties
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {items.map((item) => (
              <LogoTile key={item.id} item={item} canHover={canHover} />
            ))}
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="h-px w-full bg-[var(--border)]" />

        {/* Part B: CVE Advisories Ledger */}
        <div className="bg-[var(--bg-surface)]/45 p-4 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <Terminal className="h-3.5 w-3.5 text-[var(--mint)]" />
              <span>Assigned CVE Advisories</span>
            </div>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              Tap or click ID to copy · Verified on CVE.org
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
            {cves.map((cve) => (
              <CveCard key={cve.id} cve={cve} canHover={canHover} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
