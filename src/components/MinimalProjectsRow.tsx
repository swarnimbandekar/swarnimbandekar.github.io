'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import { ArrowUpRight, Code2, ExternalLink, Minus, Plus } from 'lucide-react';
import type { ProjectItem } from '@/data/portfolio';
import {
  extractRepoFullName,
  extractRepoName,
  GITHUB_REPOS_ENDPOINT,
} from '@/lib/github';

interface MinimalProjectsRowProps {
  projects: ProjectItem[];
  initialStars?: Record<string, number>;
}

interface MinimalProjectCardProps {
  project: ProjectItem;
  starCount: number;
  isExpanded: boolean;
  canHoverSpotlight: boolean;
  onToggle: () => void;
}

function MinimalProjectCard({
  project,
  starCount,
  isExpanded,
  canHoverSpotlight,
  onToggle,
}: MinimalProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const mousePxX = useMotionValue(-999);
  const mousePxY = useMotionValue(-999);

  const spotlightBorder = useMotionTemplate`radial-gradient(340px circle at ${mousePxX}px ${mousePxY}px, var(--accent-border), transparent 72%)`;
  const spotlightSurface = useMotionTemplate`radial-gradient(400px circle at ${mousePxX}px ${mousePxY}px, var(--spotlight-sheen), transparent 68%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!canHoverSpotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mousePxX.set(e.clientX - rect.left);
    mousePxY.set(e.clientY - rect.top);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <article
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`group relative flex flex-col justify-between min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] dark:shadow-none hover:border-[var(--border-strong)] transition-[flex-grow,border-color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        isExpanded
          ? 'min-h-[240px] h-auto lg:h-[400px] lg:flex-[3.2]'
          : 'min-h-[156px] sm:min-h-[180px] lg:min-h-[260px] lg:h-[400px] lg:flex-1'
      }`}
    >
      {/* Pointer-tracked 1px optical spotlight border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl p-px transition-opacity duration-300"
        style={{ opacity: hovered && canHoverSpotlight ? 1 : 0 }}
      >
        <motion.div
          style={{
            background: spotlightBorder,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          className="h-full w-full rounded-2xl p-px"
        />
      </div>

      {/* Subtle optical surface sheen */}
      <motion.div
        aria-hidden="true"
        style={{
          background: spotlightSurface,
          opacity: hovered && canHoverSpotlight ? 1 : 0,
        }}
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
      />

      {/* Top metadata row */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 border-b border-[var(--border)] pb-3.5">
        <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0">
          {project.year}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
            <span aria-hidden="true">★</span>
            <span>{starCount}</span>
          </span>
          {project.featured && (
            <span className="rounded bg-[var(--text-primary)] px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--bg)]">
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* Center content: collapsed vs expanded */}
      {!isExpanded ? (
        <div className="relative z-10 flex-1 flex flex-col justify-center py-4 lg:py-6 min-w-0">
          <h3 className="font-display text-lg sm:text-[21px] font-bold tracking-[-0.025em] text-[var(--text-primary)] truncate transition-colors group-hover:text-[var(--accent)]">
            {project.title}
          </h3>
          {project.stack.length > 0 && (
            <div className="mt-2 sm:mt-2.5 flex items-center gap-2 min-w-0">
              <span className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)] truncate max-w-[160px] sm:max-w-[130px]">
                {project.stack[0]}
              </span>
              {project.stack.length > 1 && (
                <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0">
                  +{project.stack.length - 1}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          key={`${project.id}-expanded`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          className="relative z-10 flex-1 flex flex-col justify-between py-4 sm:py-5 min-w-0 overflow-y-auto no-scrollbar"
        >
          <div>
            <h3 className="font-display text-xl sm:text-3xl font-bold tracking-[-0.03em] text-[var(--text-primary)]">
              {project.title}
            </h3>
            <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[var(--text-primary)]/90">
              {project.tagline}
            </p>
          </div>

          <div>
            <div className="my-4 border-t border-[var(--border)]" />

            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
              DETAILS
            </div>
            <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-[var(--text-secondary)] lg:line-clamp-3">
              {project.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>

              {project.live ? (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Live</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  title="No live demo yet"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[var(--text-muted)]/55 cursor-not-allowed"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Live</span>
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom expand/collapse bar */}
      <div className="relative z-10 flex items-center justify-between border-t border-[var(--border)] pt-3.5 font-mono text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
        <span>{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
        {isExpanded ? (
          project.writeup ? (
            <Link
              href={project.writeup}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-medium normal-case tracking-normal text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              <span>case study →</span>
            </Link>
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </div>
    </article>
  );
}

export function MinimalProjectsRow({
  projects,
  initialStars = {},
}: MinimalProjectsRowProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [starsMap, setStarsMap] = useState<Record<string, number>>(initialStars);
  const [canHoverSpotlight, setCanHoverSpotlight] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanHoverSpotlight(canHover && !reduced);
  }, []);

  const extraReposKey = Array.from(
    new Set(
      projects
        .map((p) => extractRepoFullName(p.github))
        .filter((fn) => fn.includes('/') && !fn.startsWith('swarnimbandekar/'))
    )
  ).join(',');

  useEffect(() => {
    let cancelled = false;
    const headers = { Accept: 'application/vnd.github+json' };

    fetch(GITHUB_REPOS_ENDPOINT, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          repos: Array<{
            name?: string;
            full_name?: string;
            stargazers_count?: number;
          }> | null
        ) => {
          if (cancelled || !Array.isArray(repos)) return;
          const next: Record<string, number> = {};
          for (const repo of repos) {
            if (typeof repo?.stargazers_count !== 'number') continue;
            if (typeof repo?.name === 'string') {
              next[repo.name.toLowerCase()] = repo.stargazers_count;
            }
            if (typeof repo?.full_name === 'string') {
              next[repo.full_name.toLowerCase()] = repo.stargazers_count;
            }
          }
          if (Object.keys(next).length > 0) {
            setStarsMap((prev) => ({ ...prev, ...next }));
          }
        }
      )
      .catch(() => {
        // Keep initialStars or fallback on rate limit / offline
      });

    const extraRepos = extraReposKey ? extraReposKey.split(',') : [];
    for (const fullName of extraRepos) {
      fetch(`https://api.github.com/repos/${fullName}`, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            repo: {
              name?: string;
              full_name?: string;
              stargazers_count?: number;
            } | null
          ) => {
            if (cancelled || !repo || typeof repo.stargazers_count !== 'number') {
              return;
            }
            const count = repo.stargazers_count;
            setStarsMap((prev) => ({
              ...prev,
              [fullName]: count,
              ...(typeof repo.full_name === 'string'
                ? { [repo.full_name.toLowerCase()]: count }
                : {}),
              ...(typeof repo.name === 'string'
                ? { [repo.name.toLowerCase()]: count }
                : {}),
            }));
          }
        )
        .catch(() => {
          // Ignore rate limit / offline errors
        });
    }

    return () => {
      cancelled = true;
    };
  }, [extraReposKey]);

  if (projects.length === 0) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
      {projects.map((project) => {
        const fullKey = extractRepoFullName(project.github);
        const repoKey = extractRepoName(project.github);
        const starCount =
          starsMap[fullKey] ?? starsMap[repoKey] ?? project.stars ?? 0;
        const isExpanded = expandedId === project.id;

        return (
          <MinimalProjectCard
            key={project.id}
            project={project}
            starCount={starCount}
            isExpanded={isExpanded}
            canHoverSpotlight={canHoverSpotlight}
            onToggle={() =>
              setExpandedId((prev) => (prev === project.id ? null : project.id))
            }
          />
        );
      })}
    </div>
  );
}
