import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { PROFILE } from '@/data/portfolio';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Swarnim Bandekar for security engineering roles, research collaborations, or responsible disclosures.',
};

const CHANNELS = [
  {
    tag: 'Email',
    handle: PROFILE.email,
    desc: 'Best for security research, engineering roles, responsible disclosures, or project inquiries.',
    href: `mailto:${PROFILE.email}`,
    external: false,
  },
  {
    tag: 'GitHub',
    handle: 'github.com/swarnimbandekar',
    desc: 'Open-source security tools, CTF infrastructure, and side projects.',
    href: PROFILE.socials.github,
    external: true,
  },
  {
    tag: 'LinkedIn',
    handle: 'linkedin.com/in/swarnimbandekar',
    desc: 'Work history, certification verifications, and direct recruiting messages.',
    href: PROFILE.socials.linkedin,
    external: true,
  },
  {
    tag: 'X / Twitter',
    handle: '@dirtrav',
    desc: 'Quick DMs, bug bounty notes, and CTF dispatches.',
    href: PROFILE.socials.twitter,
    external: true,
  },
  {
    tag: 'Medium',
    handle: 'medium.com/@swarnimbandekar',
    desc: 'Cross-posted security writeups and walkthroughs.',
    href: PROFILE.socials.medium,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 sm:pt-28 pb-10">
      <header className="mb-8 sm:mb-10 border-b border-[var(--border)] pb-6 sm:pb-8">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Contact
        </div>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
          Let’s talk shop
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
          DMs and email are open for offensive security roles, AppSec engineering, CTF collaborations, or interesting bugs.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <CopyEmailButton variant="primary" />
          <a
            href={`mailto:${PROFILE.email}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 font-mono text-xs text-[var(--text-primary)] hover:border-[var(--accent-border)]"
          >
            <span>Open mail app</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)]">
        {CHANNELS.map((ch) => (
          <a
            key={ch.tag}
            href={ch.href}
            target={ch.external ? '_blank' : undefined}
            rel={ch.external ? 'noopener noreferrer' : undefined}
            className="group flex flex-col justify-between bg-[var(--bg-elevated)] p-6 transition-colors hover:bg-[var(--bg-surface)]"
          >
            <div>
              <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
                {ch.tag}
              </span>
              <h2 className="font-display mt-3 text-lg sm:text-xl font-bold text-[var(--text-primary)] break-all">
                {ch.handle}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {ch.desc}
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] transition-all group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent-border)]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
