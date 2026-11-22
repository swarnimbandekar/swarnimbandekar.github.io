'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Copy, Check, ArrowUp } from 'lucide-react';
import { PROFILE } from '@/data/portfolio';

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <footer className="relative z-10 mt-16 sm:mt-24 border-t border-[var(--border)] bg-[var(--bg-elevated)]/85 backdrop-blur-md no-print">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-20 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[var(--border)]">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mint)]" />
              Let’s talk · {PROFILE.location}
            </div>
            <h2 className="font-display mt-3 text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-[var(--text-primary)] leading-[1.12]">
              Open for security engineering, red-team roles, and interesting builds.
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
              Whether you’re hiring, want to collaborate on offensive tooling, or want to compare notes on a weird bug - my inbox and DMs are open.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--text-primary)] px-4 sm:px-4.5 py-2.5 font-sans text-xs font-medium text-[var(--bg)] transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-[#34d399]" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{copied ? 'Email copied' : PROFILE.email}</span>
              </button>
              <Link
                href="/resume"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4.5 py-2.5 font-sans text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-border)]"
              >
                <span>Resume / CV</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4.5 py-2.5 font-sans text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <span>Projects</span>
              </Link>
            </div>
          </div>

          {/* Right Quick Links */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6 font-sans text-[13px]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Pages</div>
              <ul className="mt-3 space-y-2.5 font-medium text-[var(--text-secondary)]">
                <li><Link href="/" className="hover:text-[var(--text-primary)]">Index</Link></li>
                <li><Link href="/projects" className="hover:text-[var(--text-primary)]">Projects</Link></li>
                <li><Link href="/resume" className="hover:text-[var(--text-primary)]">Resume</Link></li>
                <li><Link href="/blog" className="hover:text-[var(--text-primary)]">Writing</Link></li>
                <li><Link href="/about" className="hover:text-[var(--text-primary)]">About</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--text-primary)]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Elsewhere</div>
              <ul className="mt-3 space-y-2.5 font-medium text-[var(--text-secondary)]">
                <li>
                  <a href={PROFILE.socials.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]">
                    GitHub <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={PROFILE.socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]">
                    LinkedIn <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={PROFILE.socials.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]">
                    X (@dirtrav) <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href={PROFILE.socials.medium} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]">
                    Medium <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                    RSS Feed
                  </a>
                </li>
                <li>
                  <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
                    llms.txt
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Up We Go */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Swarnim Bandekar</span>
            <Link href="/privacy-policy" className="hover:text-[var(--text-primary)]">Privacy</Link>
            <Link href="/terms-conditions" className="hover:text-[var(--text-primary)]">Terms</Link>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <span>up we go</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
