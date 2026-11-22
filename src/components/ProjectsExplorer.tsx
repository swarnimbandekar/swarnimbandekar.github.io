'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS, type ProjectItem } from '@/data/portfolio';
import { MinimalProjectsRow } from '@/components/MinimalProjectsRow';

const CATEGORIES: { id: 'all' | ProjectItem['category']; label: string }[] = [
  { id: 'all', label: `All (${PROJECTS.length})` },
  { id: 'security-tools', label: 'Security Tools' },
  { id: 'ai-security', label: 'Threat Detection' },
  { id: 'dev-tools', label: 'Dev Tools' },
];

export function ProjectsExplorer({
  initialStars = {},
}: {
  initialStars?: Record<string, number>;
}) {
  const [activeCat, setActiveCat] = useState<'all' | ProjectItem['category']>('all');

  const filtered = useMemo(() => {
    if (activeCat === 'all') return PROJECTS;
    return PROJECTS.filter((p) => p.category === activeCat);
  }, [activeCat]);

  const featuredProjects = filtered.filter((p) => !p.sideQuest);
  const sideQuests = filtered.filter((p) => p.sideQuest);

  return (
    <div className="space-y-12">
      {/* Minimal Category Filter */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="tablist"
        aria-label="Filter projects by category"
      >
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeCat;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCat(cat.id)}
              className={`relative rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                active
                  ? 'text-[var(--bg)] font-medium'
                  : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="project-filter-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[var(--text-primary)]"
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {featuredProjects.length > 0 && (
        <section aria-labelledby="featured-projects-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="featured-projects-heading"
              className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]"
            >
              Featured
            </h2>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              <span className="sm:hidden">tap card to expand</span>
              <span className="hidden sm:inline">click card to expand</span>
            </span>
          </div>
          <MinimalProjectsRow projects={featuredProjects} initialStars={initialStars} />
        </section>
      )}

      {sideQuests.length > 0 && (
        <section aria-labelledby="side-quests-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="side-quests-heading"
              className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]"
            >
              Side Quests
            </h2>
          </div>
          <MinimalProjectsRow projects={sideQuests} initialStars={initialStars} />
        </section>
      )}
    </div>
  );
}
