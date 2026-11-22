'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Copy, Check, ArrowUpRight } from 'lucide-react';
import {
  PROFILE,
  EDUCATION,
  RESUME_SKILLS,
  RESUME_EXPERIENCE,
  RESUME_CERTIFICATIONS,
  ACHIEVEMENTS,
} from '@/data/portfolio';

export function ResumeClient() {
  const [view, setView] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('print=1')) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const jsonString = JSON.stringify(
    {
      name: PROFILE.name,
      email: PROFILE.email,
      website: 'https://swarnimbandekar.in',
      socials: {
        linkedin: 'linkedin.com/in/swarnimbandekar',
        github: 'github.com/swarnimbandekar',
        twitter: 'x.com/dirtrav',
      },
      education: EDUCATION,
      technicalSkills: RESUME_SKILLS,
      workExperience: RESUME_EXPERIENCE,
      certifications: RESUME_CERTIFICATIONS.map((c) => ({
        title: c.title,
        issuer: c.issuer,
      })),
      achievements: ACHIEVEMENTS,
    },
    null,
    2
  );

  return (
    <div>
      {/* Top Toolbar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5 no-print">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1" role="tablist">
          {(['visual', 'json'] as const).map((mode) => {
            const active = view === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(mode)}
                className={`relative rounded-full px-3.5 py-1 font-sans text-xs transition-colors cursor-pointer ${
                  active ? 'text-[var(--text-primary)] font-semibold' : 'font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="resume-view-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)]"
                  />
                )}
                <span className="relative z-10">
                  {mode === 'visual' ? 'Visual Resume' : '{ } JSON'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3.5 py-1.5 font-sans text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-border)] cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--mint)]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Email'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--text-primary)] px-4 py-1.5 font-sans text-xs font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Animated Visual <-> JSON Switcher */}
      <AnimatePresence mode="wait">
        {view === 'json' ? (
          <motion.div
            key="json"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[#0b0b0f] text-zinc-200 no-print"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-[#121218] px-4 py-2.5 font-mono text-xs text-zinc-400">
              <span>swarnimbandekar.resume.json</span>
              <span className="text-[#34d399]">200 OK</span>
            </div>
            <pre className="overflow-x-auto p-3.5 sm:p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-300">
              <code>{jsonString}</code>
            </pre>
          </motion.div>
        ) : (
          <motion.div
            key="visual"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 sm:space-y-10"
          >
            {/* Header Summary Card */}
            <section className="surface-card rounded-2xl p-5 sm:p-8 print:border-zinc-300 print:shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-5 sm:gap-6">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <img
                    src="/static/logo.jpg"
                    alt={PROFILE.name}
                    width={64}
                    height={64}
                    className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-2xl border border-[var(--border-strong)] object-cover no-print"
                  />
                  <div className="min-w-0">
                    <h1 className="font-display text-xl sm:text-3xl font-bold tracking-[-0.03em]">
                      {PROFILE.name}
                    </h1>
                    <p className="font-sans text-xs sm:text-sm font-medium text-[var(--accent)] mt-0.5">
                      {PROFILE.role}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] sm:text-xs text-[var(--text-muted)]">
                      <a href={`mailto:${PROFILE.email}`} className="break-all hover:text-[var(--text-primary)]">
                        {PROFILE.email}
                      </a>
                      <span>|</span>
                      <span>swarnimbandekar.in</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5 font-mono text-xs text-[var(--text-secondary)]">
                  <a href={PROFILE.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                    linkedin.com/in/swarnimbandekar ↗
                  </a>
                  <a href={PROFILE.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                    github.com/swarnimbandekar ↗
                  </a>
                  <a href={PROFILE.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                    x.com/dirtrav ↗
                  </a>
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] mb-4">
                Education
              </h2>
              <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                {EDUCATION.map((edu) => (
                  <div
                    key={edu.school}
                    className="flex flex-wrap items-baseline justify-between gap-2 p-5 sm:px-6"
                  >
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {edu.school}
                      </h3>
                      <p className="mt-0.5 text-sm italic text-[var(--text-secondary)]">
                        {edu.degree}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {edu.period}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical Skills */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] mb-4">
                Technical Skills
              </h2>
              <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                {RESUME_SKILLS.map((group) => (
                  <div key={group.category} className="p-5 sm:px-6">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                      {group.category}:
                    </span>{' '}
                    <span className="text-sm text-[var(--text-secondary)]">
                      {group.items.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Work Experience */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] mb-4">
                Work Experience
              </h2>
              <div className="space-y-4">
                {RESUME_EXPERIENCE.map((exp) => (
                  <article
                    key={`${exp.org}-${exp.role}`}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 sm:gap-3">
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {exp.org} <span className="text-[var(--text-muted)] font-normal">|</span>{' '}
                        <span className="text-[var(--accent)]">{exp.role}</span>{' '}
                        <span className="text-[var(--text-muted)] font-normal">|</span>{' '}
                        <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{exp.location}</span>
                      </h3>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 sm:px-3 py-1 font-mono text-[11px] text-[var(--text-muted)]">
                        {exp.period}
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {exp.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--border-strong)]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] mb-4">
                Certifications
              </h2>
              <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                {RESUME_CERTIFICATIONS.map((cert) => (
                  <div
                    key={cert.title}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-6 sm:py-4"
                  >
                    <div className="flex items-start gap-2.5 text-sm text-[var(--text-primary)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>
                        <strong className="font-semibold">{cert.title}</strong>{' '}
                        <span className="text-[var(--text-muted)]">|</span>{' '}
                        <span className="text-[var(--text-secondary)]">{cert.issuer}</span>
                      </span>
                    </div>
                    {cert.reviewUrl && (
                      <Link
                        href={cert.reviewUrl}
                        className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent)] hover:underline no-print"
                      >
                        <span>Read review</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] mb-4">
                Achievements
              </h2>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-6">
                <ul className="space-y-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {ACHIEVEMENTS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mint)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
