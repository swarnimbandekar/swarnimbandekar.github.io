'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import type { ProjectItem } from '@/data/portfolio';
import { ProjectVisualPreview } from '@/components/ProjectVisualPreview';

interface ExpandableProjectCardProps {
  project: ProjectItem;
  indexLabel?: string;
  variant?: 'bento' | 'featured' | 'compact';
  className?: string;
}

const SPRING_CFG = { stiffness: 240, damping: 24, mass: 0.6 };

export function ExpandableProjectCard({
  project,
  indexLabel,
  variant = 'bento',
  className = '',
}: ExpandableProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const mousePxX = useMotionValue(-999);
  const mousePxY = useMotionValue(-999);

  const rotateX = useSpring(rawRotateX, SPRING_CFG);
  const rotateY = useSpring(rawRotateY, SPRING_CFG);

  const spotlightBorder = useMotionTemplate`radial-gradient(360px circle at ${mousePxX}px ${mousePxY}px, var(--accent-border), transparent 72%)`;
  const spotlightSurface = useMotionTemplate`radial-gradient(420px circle at ${mousePxX}px ${mousePxY}px, var(--spotlight-sheen), transparent 68%)`;

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTiltEnabled(canHover && !reduced);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mousePxX.set(px);
    mousePxY.set(py);

    const nx = (px / rect.width) - 0.5;
    const ny = (py / rect.height) - 0.5;
    rawRotateY.set(nx * 10);
    rawRotateX.set(-ny * 8.5);
  };

  const handlePointerEnter = () => {
    setHovered(true);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const renderExpandableNotes = () => (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Engineering Notes
            </div>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {project.writeup && (
              <Link
                href={project.writeup}
                className="mt-3 inline-flex items-center gap-1 font-sans text-xs font-medium text-[var(--accent)] hover:underline"
              >
                Read companion writeup →
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderFooterBar = (compactMargin = false) => (
    <div
      style={tiltEnabled ? { transform: 'translateZ(20px)' } : undefined}
      className={`${compactMargin ? 'mt-5' : 'mt-6'} flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4`}
    >
      <div className="flex flex-wrap gap-1.5">
        {project.stack.slice(0, variant === 'featured' ? 5 : 4).map((tech) => (
          <span
            key={tech}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 py-1 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <span>{expanded ? 'COLLAPSE' : 'EXPAND'}</span>
          {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </button>

        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.title} on GitHub`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] transition-all group-hover:bg-[var(--accent)] group-hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ perspective: 1100 }} className={className}>
      <motion.article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          tiltEnabled
            ? {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
            : undefined
        }
        className="project-card-3d group relative flex h-full flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.07)] dark:shadow-none transition-colors duration-300"
      >
        {/* Precision 1px Pointer-Tracked Optical Spotlight Border */}
        <motion.div
          aria-hidden="true"
          style={{
            background: spotlightBorder,
            opacity: hovered && tiltEnabled ? 1 : 0,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          className="pointer-events-none absolute -inset-px rounded-2xl p-px transition-opacity duration-300"
        />

        {/* Subtle Optical Surface Sheen */}
        <motion.div
          aria-hidden="true"
          style={{
            background: spotlightSurface,
            opacity: hovered && tiltEnabled ? 1 : 0,
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        />

        {variant === 'featured' ? (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center h-full">
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {indexLabel && (
                      <span className="font-mono text-[11px] font-semibold text-[var(--accent)] mr-1">
                        {indexLabel}
                      </span>
                    )}
                    {project.roles.slice(0, 2).map((role, idx) => (
                      <span
                        key={role}
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${
                          idx === 0
                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'border-[var(--border-strong)] text-[var(--text-muted)]'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {project.categoryLabel} · {project.year}
                  </span>
                </div>

                <div style={tiltEnabled ? { transform: 'translateZ(20px)' } : undefined}>
                  <h3 className="font-display mt-4 text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[var(--text-primary)]">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-sans text-sm font-medium tracking-[-0.01em] text-[var(--accent)]">
                    {project.tagline}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {project.description}
                </p>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    {project.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/80 px-3 py-2.5"
                      >
                        <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                          {metric.value}
                        </div>
                        <div className="mt-0.5 font-mono text-[10.5px] text-[var(--text-muted)]">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {renderExpandableNotes()}
              </div>

              {renderFooterBar()}
            </div>

            <div
              style={tiltEnabled ? { transform: 'translateZ(16px)' } : undefined}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <ProjectVisualPreview
                projectId={project.id}
                hovered={hovered}
                className="h-52 sm:h-64"
              />
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              {/* Top Meta & Role Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {indexLabel && (
                    <span className="font-mono text-[11px] font-semibold text-[var(--accent)] mr-1">
                      {indexLabel}
                    </span>
                  )}
                  {project.roles.slice(0, 2).map((role, idx) => (
                    <span
                      key={role}
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${
                        idx === 0
                          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'border-[var(--border-strong)] text-[var(--text-muted)]'
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {project.categoryLabel} · {project.year}
                </span>
              </div>

              {/* Architectural Visual Preview for Selected Work Bento Cards */}
              {variant === 'bento' && (
                <div
                  style={tiltEnabled ? { transform: 'translateZ(14px)' } : undefined}
                  className="mt-4"
                >
                  <ProjectVisualPreview projectId={project.id} hovered={hovered} />
                </div>
              )}

              {/* Title & Description */}
              <div style={tiltEnabled ? { transform: 'translateZ(20px)' } : undefined}>
                <h3
                  className={`font-display font-bold tracking-[-0.025em] text-[var(--text-primary)] ${
                    variant === 'compact' ? 'mt-3.5 text-lg sm:text-xl' : 'mt-4 text-xl sm:text-2xl'
                  }`}
                >
                  {project.title}
                </h3>
                <p className="mt-1 font-sans text-[13.5px] font-medium tracking-[-0.01em] text-[var(--accent)]">
                  {project.tagline}
                </p>
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {project.description}
              </p>

              {renderExpandableNotes()}
            </div>

            {renderFooterBar(variant === 'compact')}
          </div>
        )}
      </motion.article>
    </div>
  );
}
