import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PROFILE } from '@/data/portfolio';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Swarnim Bandekar - security researcher focused on web/API security, Active Directory red teaming, bug bounty, and security engineering.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-10">
      <header className="mb-10 border-b border-[var(--border)] pb-8">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
          About
        </div>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--text-primary)]">
          Breaking things carefully, then building the fix.
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed">
            I’m Swarnim Bandekar (often going by <code className="font-mono text-sm text-[var(--accent)]">pixy</code> or <code className="font-mono text-sm text-[var(--accent)]">@dirtrav</code>) - a security researcher and software builder based in Bengaluru, India.
          </p>

          <p>
            Most of my time goes into offensive security across web apps, APIs, Active Directory networks, and malware analysis. When I hit a friction point during testing or research, I usually end up writing the tool I wish existed.
          </p>

          <div className="pt-2">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
              A few things that define how I work
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>
                  <strong className="text-[var(--text-primary)]">Hands-on labs over theory:</strong> Passed the 6-hour <Link href="/blog/crta" className="text-[var(--accent)] underline underline-offset-4">CRTA</Link> Active Directory red-team exam with 100% and earned <Link href="/blog/ascp" className="text-[var(--accent)] underline underline-offset-4">ASCP</Link> inside a zero-MCQ 12-hour API assessment.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>
                  <strong className="text-[var(--text-primary)]">Building my own tools:</strong> Built <a href="https://github.com/Bidoytu/Bidoytu" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4">Bidoytu</a> (Electron + Python HTTP interception proxy) and <a href="https://github.com/swarnimbandekar/uniguard" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4">UniGuard</a> (metadata-only threat detection).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>
                  <strong className="text-[var(--text-primary)]">Dissecting real incidents:</strong> After an info-stealer hijacked my own Discord session past 2FA, I <Link href="/blog/discord-token-stealer" className="text-[var(--accent)] underline underline-offset-4">reverse-engineered the malware</Link> to document how DPAPI and LevelDB session theft actually happen.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>
                  <strong className="text-[var(--text-primary)]">Community &amp; CTF infra:</strong> Engineered the backend for ReCon 2026 (600+ participants), built a King-of-the-Hill lab matrix, and authored multi-stage web/misc CTF challenges.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 font-mono text-xs font-medium text-[var(--bg)]"
            >
              <span>View Projects</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 font-mono text-xs text-[var(--text-primary)] hover:border-[var(--accent-border)]"
            >
              <span>Inspect Resume</span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span>Read Writeups</span>
            </Link>
          </div>
        </div>

        {/* Right Profile Card */}
        <aside className="lg:col-span-5">
          <div className="surface-card rounded-2xl p-6">
            <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
              <img
                src="/static/logo.jpg"
                alt={PROFILE.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-[var(--border-strong)] object-cover"
              />
              <div>
                <div className="font-display text-lg font-bold text-[var(--text-primary)]">
                  {PROFILE.name}
                </div>
                <div className="font-mono text-xs text-[var(--accent)]">
                  pixy · @dirtrav
                </div>
                <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">
                  {PROFILE.location}
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2.5">
                <dt className="text-[var(--text-muted)]">Focus</dt>
                <dd className="text-right text-[var(--text-primary)]">Web/API · Red Team · Tooling</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2.5">
                <dt className="text-[var(--text-muted)]">Certs</dt>
                <dd className="text-right text-[var(--mint)]">eWPTX · CRTA · ASCP · CASA</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2.5">
                <dt className="text-[var(--text-muted)]">Daily OS</dt>
                <dd className="text-right text-[var(--text-primary)]">Windows &amp; Kali</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Email</dt>
                <dd className="text-right">
                  <a href={`mailto:${PROFILE.email}`} className="text-[var(--accent)] hover:underline">
                    {PROFILE.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
