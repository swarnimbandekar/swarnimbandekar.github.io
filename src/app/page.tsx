import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { HeroBadgeStage } from '@/components/HeroBadgeStage';
import { MinimalProjectsRow } from '@/components/MinimalProjectsRow';
import { HallOfFameSection } from '@/components/HallOfFameSection';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PROJECTS, CERTIFICATIONS, EXPERIENCE, HALL_OF_FAME, CVES } from '@/data/portfolio';
import { getAllPosts } from '@/lib/blog';
import { getGitHubContributions, getGitHubRepoStars } from '@/lib/github';

export default async function HomePage() {
  const featuredProjects = PROJECTS.filter((p) => p.featured).slice(0, 4);
  const recentPosts = getAllPosts().slice(0, 5);
  const [contributions, repoStars] = await Promise.all([
    getGitHubContributions(),
    getGitHubRepoStars(),
  ]);

  return (
    <div>
      {/* 1. Interactive Physics Lanyard Hero */}
      <HeroBadgeStage initialContributions={contributions} />

      {/* 2. Things I've shipped - Minimal Horizontal Accordion */}
      <ScrollReveal>
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="projects-heading">
          <div className="mb-8 border-b border-[var(--border)] pb-5">
            <h2
              id="projects-heading"
              className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[var(--text-primary)]"
            >
              Things I&apos;ve shipped
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Selected work. Open-source security tools and systems.
              </p>
              <Link
                href="/projects"
                className="font-mono text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                view all projects →
              </Link>
            </div>
          </div>

          <MinimalProjectsRow projects={featuredProjects} initialStars={repoStars} />
        </section>
      </ScrollReveal>

      {/* 3. Hall of Fame & Assigned CVEs */}
      <ScrollReveal>
        <HallOfFameSection items={HALL_OF_FAME} cves={CVES} />
      </ScrollReveal>

      {/* 4. Writing - Minimal Editorial List (beebombshell.com inspired) */}
      <ScrollReveal>
        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="writing-heading">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                03 · Writing
              </div>
              <h2
                id="writing-heading"
                className="font-display mt-1.5 text-3xl sm:text-4xl font-bold tracking-[-0.03em]"
              >
                Dispatches &amp; writeups
              </h2>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[var(--accent)] hover:underline"
            >
              <span>All essays &amp; CTF writeups</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] dark:shadow-none">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-7 sm:py-5 transition-colors hover:bg-[var(--bg-surface)]/70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-[var(--text-muted)]">
                    <span>{post.formattedDate}</span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display mt-1.5 text-lg sm:text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
                    {post.description}
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-all group-hover:border-[var(--accent-border)] group-hover:bg-[var(--accent)] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 5. Experience & Credentials Snapshot (itsgathin.com 05 · ABOUT split) */}
      <ScrollReveal>
        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="experience-heading">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Candid Story */}
            <div className="lg:col-span-5">
              <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                04 · Experience &amp; Credentials
              </div>
              <h2
                id="experience-heading"
                className="font-display mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.12]"
              >
                From breaking student portals to shipping security systems.
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[var(--text-secondary)]">
                I learn best inside real environments - whether that’s compromising an Active Directory forest in a 6-hour CRTA exam, finding authorization gaps across live APIs, reversing an info-stealer that hit my own Discord, or running infra for 600+ CTF hackers.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-4.5 py-2.5 font-sans text-xs font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5"
                >
                  <span>Full Resume &amp; PDF</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4.5 py-2.5 font-sans text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-border)]"
                >
                  <span>More about me</span>
                </Link>
              </div>
            </div>

            {/* Right Vertical Timeline Card */}
            <div className="lg:col-span-7">
              <div className="surface-card rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 mb-5">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Timeline · {EXPERIENCE.length + CERTIFICATIONS.length} Milestones
                  </span>
                  <Link href="/resume" className="font-mono text-xs text-[var(--accent)] hover:underline">
                    Full CV →
                  </Link>
                </div>

                <div className="relative space-y-6 pl-5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border-strong)]">
                  {EXPERIENCE.map((item) => (
                    <div key={item.role} className="relative">
                      <span
                        className={`absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-elevated)] ${
                          item.active ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'
                        }`}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                          {item.role}
                        </h3>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">
                          {item.period}
                        </span>
                      </div>
                      <div className="font-sans text-xs font-medium text-[var(--accent)] mt-0.5">
                        {item.org}
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                        {item.summary}
                      </p>
                    </div>
                  ))}

                  {CERTIFICATIONS.map((cert) => (
                    <div key={cert.id} className="relative">
                      <span className="absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--mint)]" />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
                          {cert.code} - {cert.title}
                        </h3>
                        <span className="font-mono text-[11px] text-[var(--mint)]">
                          {cert.badge}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                        {cert.issuer} · {cert.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
