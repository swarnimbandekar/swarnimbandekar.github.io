import type { Metadata } from 'next';
import { ProjectsExplorer } from '@/components/ProjectsExplorer';
import { PROFILE } from '@/data/portfolio';
import { getGitHubRepoStars } from '@/lib/github';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Open-source security tools, HTTP interception proxies, threat detection pipelines, and developer tooling built by Swarnim Bandekar.',
};

export default async function ProjectsPage() {
  const repoStars = await getGitHubRepoStars();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-14 sm:pb-16">
      <header className="mb-8 sm:mb-10 border-b border-[var(--border)] pb-5 sm:pb-6">
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
          Things I&apos;ve shipped
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Selected work and side quests. Open-source security tools and systems.
          </p>
          <a
            href={PROFILE.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            github.com/swarnimbandekar →
          </a>
        </div>
      </header>

      <ProjectsExplorer initialStars={repoStars} />
    </div>
  );
}
